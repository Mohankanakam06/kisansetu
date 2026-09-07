import os
import json
import requests
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

gemini_key = os.environ.get("GEMINI_API_KEY", "")
if gemini_key:
    genai.configure(api_key=gemini_key)

from ai.agents.farmer_interface import create_listing

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
        model = genai.GenerativeModel("gemini-3.6-flash", tools=TOOLS)
        chat = model.start_chat()
        prompt = f"User ({user_id}) says: {message}"
        if media_url:
            prompt += f" [attached media: {media_url}]"

        response = chat.send_message(prompt)

        for part in response.candidates[0].content.parts:
            if fn := getattr(part, "function_call", None):
                args = dict(fn.args)
                args.setdefault("farmer_id", user_id)
                result = call_tool(fn.name, args)
                return {"intent": fn.name, "agent_called": fn.name, "result": result}

        return {"intent": "chat", "agent_called": None, "result": {"text": response.text}}
    except Exception as e:
        return {"intent": "error", "agent_called": None, "result": {"error": str(e)}}
