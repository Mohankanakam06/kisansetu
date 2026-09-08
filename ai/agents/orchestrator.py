import os
import json
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

gemini_key = os.environ.get("GEMINI_API_KEY", "")
_genai_client = genai.Client(api_key=gemini_key) if gemini_key else None

from ai.agents.farmer_interface import create_listing
from backend.redis_client import get_chat_history, save_chat_history

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

def create_farmer_listing(farmer_id: str, transcript: str, language: str = "hi"):
    """Create a new produce listing from a farmer's voice or text message.

    Args:
        farmer_id: Unique identifier of the farmer
        transcript: The farmer's spoken or written message about their produce
        language: Language code (e.g. 'hi', 'en')
    """
    pass

TOOLS = [create_farmer_listing]

def call_tool(name: str, args: dict) -> dict:
    if name == "create_farmer_listing":
        try:
            res = requests.post(f"{BASE_URL}/api/farmer/listing", json=args, timeout=5)
            if res.status_code == 200:
                return res.json()
        except Exception:
            pass
        return create_listing(
            args.get("farmer_id"),
            args.get("transcript", ""),
            args.get("language", "hi"),
            args.get("lat", 22.6939),
            args.get("lng", 72.8618)
        )
    return {"error": f"unknown tool {name}"}

def handle_query(user_id: str, message: str, message_type: str = "text", media_url: str = None):
    try:
        # Load prior conversation history from Redis / In-Memory cache
        raw_history = get_chat_history(user_id)

        prompt = f"User ({user_id}) says: {message}"
        if media_url:
            prompt += f" [attached media: {media_url}]"

        if _genai_client:
            chat = _genai_client.chats.create(
                model="gemini-3.6-flash",
                config=types.GenerateContentConfig(
                    tools=TOOLS,
                )
            )
            response = chat.send_message(prompt)

            # Track turn for conversation memory
            new_history = list(raw_history)
            new_history.append({"role": "user", "parts": [prompt]})

            if response.function_calls:
                for fn in response.function_calls:
                    args = dict(fn.args) if fn.args else {}
                    args.setdefault("farmer_id", user_id)
                    result = call_tool(fn.name, args)
                    new_history.append({"role": "model", "parts": [f"Executed {fn.name}: {json.dumps(result)}"]})
                    save_chat_history(user_id, new_history)
                    return {"intent": fn.name, "agent_called": fn.name, "result": result}

            response_text = response.text or "I am here to help you."
            new_history.append({"role": "model", "parts": [response_text]})
            save_chat_history(user_id, new_history)
            return {"intent": "chat", "agent_called": None, "result": {"text": response_text}}
        else:
            return {"intent": "chat", "agent_called": None, "result": {"text": f"Simulated AI Response: Received your request regarding '{message}'."}}
    except Exception as e:
        return {"intent": "error", "agent_called": None, "result": {"error": str(e)}}
