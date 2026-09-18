import os
import json
import logging
from dotenv import load_dotenv

logger = logging.getLogger("kisansetu.orchestrator")

try:
    from google import genai
    from google.genai import types
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    _genai_client = genai.Client(api_key=gemini_key) if gemini_key else None
except Exception:
    genai = None
    types = None
    _genai_client = None

load_dotenv(override=True)

from ai.agents.farmer_interface import create_listing
from ai.agents.aggregations import run_aggregation
from ai.agents.quality_grading import grade_photo
from ai.agents.routing import optimize_route
from ai.agents.settlement import process_payout
from backend.redis_client import get_chat_history, save_chat_history
from backend.services.llm_service import call_openrouter_chat

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

def call_tool(name: str, args: dict) -> dict:
    if name == "create_farmer_listing":
        return create_listing(
            args.get("farmer_id"),
            args.get("transcript", ""),
            args.get("language", "hi"),
            args.get("lat", 22.6939),
            args.get("lng", 72.8618)
        )
    elif name == "cluster_active_lots":
        return run_aggregation(
            args.get("eps_km", 3.0),
            args.get("min_points", 2)
        )
    elif name == "grade_lot_quality":
        return grade_photo(
            args.get("lot_id", "demo-lot"),
            args.get("photo_url")
        )
    elif name == "optimize_delivery_route":
        return optimize_route(
            args.get("order_id")
        )
    elif name == "process_stage_payout":
        return process_payout(
            args.get("order_id"),
            args.get("stage")
        )
    return {"error": f"unknown tool {name}"}

# Standard OpenAI-format tool definitions for OpenRouter
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_farmer_listing",
            "description": "Create a new produce listing from a farmer's voice or text message.",
            "parameters": {
                "type": "object",
                "properties": {
                    "transcript": {"type": "string", "description": "The farmer's spoken or written message about their produce"},
                    "language": {"type": "string", "description": "Language code (e.g. 'hi', 'en')"}
                },
                "required": ["transcript"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cluster_active_lots",
            "description": "Cluster active unstructured listings into aggregated wholesale lots.",
            "parameters": {
                "type": "object",
                "properties": {
                    "eps_km": {"type": "number", "description": "Distance radius in km"},
                    "min_points": {"type": "integer", "description": "Minimum active listings"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "grade_lot_quality",
            "description": "Grade crop quality (Grade A, B, C) via AI Vision for a specific lot.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lot_id": {"type": "string"},
                    "photo_url": {"type": "string", "description": "URL to the crop image for grading"}
                },
                "required": ["photo_url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "optimize_delivery_route",
            "description": "Optimize a multi-pickup delivery route for a given order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"}
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "process_stage_payout",
            "description": "Process escrow payout for farmers in a specific stage (pickup or delivery).",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "stage": {"type": "string", "enum": ["pickup", "delivery"]}
                },
                "required": ["order_id", "stage"]
            }
        }
    }
]

def handle_query(user_id: str, message: str, message_type: str = "text", media_url: str = None):
    try:
        raw_history = get_chat_history(user_id)

        # Convert simple dict history to OpenAI messages format
        messages = [{"role": "system", "content": "You are KisanSetu Agent Orchestrator. Help users buy wholesale, analyze listings, and create farmer listings. Use tools when appropriate."}]
        for turn in raw_history:
            if isinstance(turn, dict) and "role" in turn and "parts" in turn:
                messages.append({"role": "user" if turn["role"] == "user" else "assistant", "content": turn["parts"][0]})

        prompt = f"User ({user_id}) says: {message}"
        if media_url:
            prompt += f" [attached media: {media_url}]"

        messages.append({"role": "user", "content": prompt})

        # Try OpenRouter
        response = call_openrouter_chat(
            messages=messages,
            model="openai/gpt-4o-mini",
            tools=OPENAI_TOOLS,
            temperature=0.2
        )

        new_history = list(raw_history)
        new_history.append({"role": "user", "parts": [prompt]})

        if response:
            if response.get("tool_calls"):
                for tool_call in response["tool_calls"]:
                    fn = tool_call["function"]
                    args = json.loads(fn["arguments"]) if fn.get("arguments") else {}
                    args.setdefault("farmer_id", user_id)
                    result = call_tool(fn["name"], args)
                    new_history.append({"role": "model", "parts": [f"Executed {fn['name']}: {json.dumps(result)}"]})
                    save_chat_history(user_id, new_history)
                    return {"intent": fn["name"], "agent_called": fn["name"], "result": result}

            response_text = response.get("content") or "I processed your request."
            new_history.append({"role": "model", "parts": [response_text]})
            save_chat_history(user_id, new_history)
            return {"intent": "chat", "agent_called": None, "result": {"text": response_text}}

        else:
            logger.warning("OpenRouter failed, falling back to basic Gemini or demo response.")
            return {"intent": "chat", "agent_called": None, "result": {"text": f"Simulated AI Response: Received your request regarding '{message}'.", "demo_mode": True}}

    except Exception as e:
        logger.error(f"Orchestrator handle_query encountered error: {e}", exc_info=True)
        return {"intent": "error", "agent_called": None, "result": {"error": "AI query processing failed. Please retry your request.", "demo_mode": True}}
