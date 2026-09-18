import os
import json
import logging
import base64
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

logger = logging.getLogger("kisansetu.llm_service")

# Ensure .env is loaded
load_dotenv(override=True)

OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_TEXT_MODEL = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")
DEFAULT_VISION_MODEL = os.environ.get("OPENROUTER_VISION_MODEL", "openai/gpt-4o-mini")


def _strip_json_fences(raw_text: str) -> str:
    """Remove a leading/trailing ```json fence that models sometimes add."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def get_openrouter_api_key() -> Optional[str]:
    """Retrieve active OpenRouter API key dynamically from environment."""
    load_dotenv(override=True)
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if key and key != "dummy_key" and len(key) > 10:
        return key
    return None


def call_openrouter_chat(
    messages: List[Dict[str, Any]],
    model: str = DEFAULT_TEXT_MODEL,
    temperature: float = 0.2,
    max_tokens: int = 1000,
    tools: Optional[List[Dict[str, Any]]] = None,
    tool_choice: Optional[Any] = None,
    response_format: Optional[Dict[str, str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Call OpenRouter's OpenAI-compatible Chat Completions API.
    Returns the complete choice/message response object or None on error.
    """
    key = get_openrouter_api_key()
    if not key:
        logger.debug("OpenRouter key not present; skipping OpenRouter chat call.")
        return None

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kisansetu.in",
        "X-Title": "KisanSetu Agricultural Marketplace AI"
    }

    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    if tools:
        payload["tools"] = tools
        if tool_choice:
            payload["tool_choice"] = tool_choice
    if response_format:
        payload["response_format"] = response_format

    try:
        resp = requests.post(OPENROUTER_ENDPOINT, headers=headers, json=payload, timeout=25)
        if resp.status_code == 200:
            data = resp.json()
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]
            return None
        else:
            logger.warning(f"OpenRouter API returned status {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.warning(f"OpenRouter API call exception: {e}")
        return None


def call_openrouter_structured(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = DEFAULT_TEXT_MODEL
) -> Optional[Dict[str, Any]]:
    """
    Call OpenRouter to extract or generate structured JSON output.
    Cleans markdown formatting and parses JSON.
    """
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    res = call_openrouter_chat(
        messages=messages,
        model=model,
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    if not res or not res.get("content"):
        # Try once without response_format if model doesn't support json_object mode
        res = call_openrouter_chat(
            messages=messages,
            model=model,
            temperature=0.1
        )

    if res and res.get("content"):
        raw_text = _strip_json_fences(res["content"])
        try:
            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"Failed to parse JSON from OpenRouter response: {e}. Content: {raw_text[:200]}")
            return None

    return None


def call_openrouter_vision(
    prompt: str,
    image_input: str,
    crop_type: str = "Tomato",
    system_prompt: Optional[str] = None,
    model: str = DEFAULT_VISION_MODEL
) -> Optional[Dict[str, Any]]:
    """
    Call OpenRouter multimodal vision model for produce grading and inspection.
    Accepts:
      - Full data URL (data:image/jpeg;base64,...)
      - Public HTTP/HTTPS image URL
      - Raw base64 string
    """
    key = get_openrouter_api_key()
    if not key:
        return None

    # Format image url properly
    if image_input.startswith("http://") or image_input.startswith("https://") or image_input.startswith("data:"):
        formatted_image_url = image_input
    else:
        # Assume raw base64 string
        formatted_image_url = f"data:image/jpeg;base64,{image_input}"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    user_content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": formatted_image_url}}
    ]
    messages.append({"role": "user", "content": user_content})

    res = call_openrouter_chat(
        messages=messages,
        model=model,
        temperature=0.1,
        max_tokens=1000
    )

    if res and res.get("content"):
        raw_text = _strip_json_fences(res["content"])
        try:
            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"Vision JSON parse error: {e}. Raw output: {raw_text[:200]}")
            return None

    return None
