import re
from urllib.parse import urlparse

from flask import Blueprint, request, jsonify, current_app

from .llm import analyze_image, analyze_batch as _analyze_batch

api = Blueprint("api", __name__)

URL_PATTERN = re.compile(r"^https?://", re.IGNORECASE)


def _validate_image_url(url: str) -> str | None:
    if not url or not isinstance(url, str):
        return "imageUrl is required and must be a string."

    url = url.strip()

    if not URL_PATTERN.match(url):
        return "imageUrl must begin with http:// or https://."

    try:
        parsed = urlparse(url)
    except Exception:
        return "imageUrl could not be parsed as a URL."

    if not parsed.netloc:
        return "imageUrl must include a valid hostname."

    return None


@api.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        return jsonify({}), 204

    if not request.is_json:
        return jsonify({
            "error": "bad_request",
            "message": "Request body must be JSON (Content-Type: application/json).",
        }), 400

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({
            "error": "bad_request",
            "message": "Request body could not be parsed as JSON.",
        }), 400

    image_url = body.get("imageUrl", "")
    url_error = _validate_image_url(image_url)
    if url_error:
        return jsonify({
            "error": "invalid_url",
            "message": url_error,
        }), 422

    try:
        result = analyze_image(image_url.strip())
    except Exception as exc:
        current_app.logger.exception("LLM analysis failed for URL: %s", image_url)
        return jsonify({
            "error": "analysis_error",
            "message": f"Failed to analyze the image: {exc}",
        }), 500

    return jsonify(result), 200


@api.route("/analyze-batch", methods=["POST", "OPTIONS"])
def analyze_batch():
    if request.method == "OPTIONS":
        return jsonify({}), 204

    if not request.is_json:
        return jsonify({
            "error": "bad_request",
            "message": "Request body must be JSON (Content-Type: application/json).",
        }), 400

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({
            "error": "bad_request",
            "message": "Request body could not be parsed as JSON.",
        }), 400

    image_urls = body.get("imageUrls", [])
    if not isinstance(image_urls, list) or len(image_urls) == 0:
        return jsonify({
            "error": "bad_request",
            "message": "imageUrls must be a non-empty array.",
        }), 400

    errors = []
    for i, url in enumerate(image_urls):
        err = _validate_image_url(url)
        if err:
            errors.append(f"URL {i + 1}: {err}")
    if errors:
        return jsonify({
            "error": "invalid_url",
            "message": " ".join(errors),
        }), 422

    try:
        results = _analyze_batch([u.strip() for u in image_urls])
    except Exception as exc:
        current_app.logger.exception("Batch LLM analysis failed")
        return jsonify({
            "error": "analysis_error",
            "message": f"Failed to analyze images: {exc}",
        }), 500

    return jsonify({"results": results if results else []}), 200
