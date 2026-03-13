# Tracker — Damage Analyzer

A property-damage assessment tool built with **Python Flask** (backend) and **React** (frontend, loaded via CDN — no build step required).

---

## Overview

The app exposes API endpoints that accept image URLs and return structured damage reports. The frontend is a React app served directly from a Flask template.

The codebase has been intentionally seeded with:
- **One bug** — something in the UI renders incorrectly
- **One missing feature** — a backend endpoint that needs to be added

Your job is to find and fix the bug, then implement the missing feature.

---

## Getting started

To run the application, use the following command in the terminal:

```
python run.py
```

To debug the application using VS Code, ensure you have the following configuration in your `launch.json`:

```json
```

To use the AI agent, use the following command in the terminal:

```
aider
```

### Sample image URLs

```
https://i.ibb.co/MkN4Y06F/0-F17-A579-BB6-D-472-C-B717-79-FC3-EAC433-D-12.jpg
https://i.ibb.co/cKvGdnqp/0-F17-A579-BB6-D-472-C-B717-79-FC3-EAC433-D-13.jpg
https://i.ibb.co/LXwCD4Pb/AAECA412-8961-41-D7-9-ED5-3-D484-A3337-DC-5.jpg
https://i.ibb.co/jkrb3sMb/AAECA412-8961-41-D7-9-ED5-3-D484-A3337-DC-13.jpg
```

---

## What to Complete

### Task 1 — Find and fix the bug

Open the app, submit an image URL, and look at the result panel. One of the values is displayed incorrectly. Find where in the frontend code it goes wrong, fix it, and be ready to explain the cause.

### Task 2 — Implement the batch endpoint

The app has a Batch tab in the UI — it's wired up and ready to go, but the backend isn't returning results yet. Implement the missing logic so the Batch tab works end-to-end.

The endpoint should:
1. Accept `POST /analyze-batch` with body `{ "imageUrls": ["url1", "url2", ...] }`
2. Validate that every URL is a valid `http`/`https` URL
3. Return `{ "results": [ <report>, ... ] }` in the same order as the input
4. Return appropriate error responses for invalid input

---

## API Contract

### `POST /analyze` — single image

**Request**
```json
{ "imageUrl": "https://example.com/photo.jpg" }
```

**Response 200**
```json
{
  "severity":   "none | minor | moderate | severe | critical",
  "confidence": 0.87,
  "categories": ["structural", "water"],
  "summary":    "Moderate water and structural damage detected..."
}
```

**Errors**

| Status | `error` field    | Cause                           |
|--------|------------------|---------------------------------|
| 400    | `bad_request`    | Non-JSON body or malformed JSON |
| 422    | `invalid_url`    | Missing or non-http/https URL   |
| 500    | `analysis_error` | Internal / LLM failure          |

### `POST /analyze-batch`

**Request**
```json
{ "imageUrls": ["https://example.com/a.jpg", "https://example.com/b.jpg"] }
```

**Response 200**
```json
{
  "results": [
    { "severity": "minor", "confidence": 0.83, "categories": ["paint"], "summary": "..." },
    { "severity": "severe", "confidence": 0.91, "categories": ["structural"], "summary": "..." }
  ]
}
```

---

## Constraints

- Any reference material is fine (docs, Stack Overflow, etc.)
- The Replit AI agent is available and encouraged — but be ready to explain every decision
- Do **not** change the existing `POST /analyze` contract
- Do **not** introduce new runtime dependencies without noting why

---

## Project Structure

```
damage-analyzer/
├── app/
│   ├── __init__.py
│   ├── api.py
│   ├── config.py
│   ├── llm.py
│   ├── routes.py
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
├── run.py
├── requirements.txt
└── .env.example
```
