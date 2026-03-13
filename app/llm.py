"""
LLM wrapper for damage analysis.

Requires OPENAI_API_KEY to be set in the environment.
LLM_BASE_URL defaults to https://api.openai.com/v1.
"""

import json
import requests
from flask import current_app


DAMAGE_REPORT_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "damage_report",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "severity": {
                    "type": "string",
                    "enum": ["none", "minor", "moderate", "severe", "critical"],
                },
                "confidence": {
                    "type": "number",
                },
                "categories": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "summary": {
                    "type": "string",
                },
            },
            "required": ["severity", "confidence", "categories", "summary"],
            "additionalProperties": False,
        },
    },
}


def analyze_batch(image_urls: list) -> list:
    results = []
    return results


def analyze_image(image_url: str) -> dict:
    """
    Analyze an image URL for damage using OpenAI GPT-4o vision.

    Args:
        image_url: A validated http/https URL pointing to an image.

    Returns:
        dict with keys: severity, confidence, categories, summary
    """
    api_key = current_app.config["LLM_API_KEY"]
    base_url = current_app.config["LLM_BASE_URL"].rstrip("/")

    if not api_key:
        raise RuntimeError(
            "No API key found. Set OPENAI_API_KEY in the environment."
        )

    system_prompt = (
        "You are a professional property damage assessor. "
        "Inspect the image carefully and return a structured damage report. "
        "severity must be one of: none, minor, moderate, severe, critical. "
        "confidence must be a float between 0.0 and 1.0. "
        "categories should list damage types visible in the image (e.g. structural, "
        "water, fire, impact, corrosion, paint, glass, mechanical, electrical, cosmetic). "
        "Use an empty array if there is no damage. "
        "summary should be one or two plain-English sentences describing your findings."
    )

    response = requests.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4o",
            "response_format": DAMAGE_REPORT_SCHEMA,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url, "detail": "high"},
                        },
                        {
                            "type": "text",
                            "text": "Analyze this image for damage.",
                        },
                    ],
                },
            ],
            "max_tokens": 512,
        },
        timeout=45,
    )

    if not response.ok:
        try:
            err = response.json().get("error", {})
            if err.get("code") in ("invalid_image_url", "invalid_image_format"):
                raise RuntimeError(
                    "The image URL could not be fetched or is not a supported image format. "
                    "Make sure the URL points directly to a .jpg, .png, .gif, or .webp file "
                    "and is publicly accessible."
                )
        except (ValueError, AttributeError):
            pass
        raise RuntimeError(
            f"OpenAI API error {response.status_code}: {response.text}"
        )

    content = response.json()["choices"][0]["message"]["content"]
    result = json.loads(content)
    # Ensure confidence is a float between 0.0 and 1.0
    if "confidence" in result:
        result["confidence"] = float(result["confidence"])
    return result
