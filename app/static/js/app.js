"use strict";

const form = document.getElementById("analyze-form");
const urlInput = document.getElementById("image-url");
const submitBtn = document.getElementById("submit-btn");
const errorPanel = document.getElementById("error-panel");
const resultPanel = document.getElementById("result-panel");

// Result fields
const severityEl = document.getElementById("result-severity");
const confidenceEl = document.getElementById("result-confidence");
const confidenceBar = document.getElementById("confidence-bar");
const categoriesEl = document.getElementById("result-categories");
const summaryEl = document.getElementById("result-summary");

function showError(message) {
  errorPanel.textContent = message;
  errorPanel.classList.add("visible");
  resultPanel.classList.remove("visible");
}

function clearError() {
  errorPanel.classList.remove("visible");
  errorPanel.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    submitBtn.classList.add("loading");
  } else {
    submitBtn.classList.remove("loading");
  }
}

function renderResult(data) {
  // Severity
  const severity = data.severity ?? "unknown";
  severityEl.textContent = severity.charAt(0).toUpperCase() + severity.slice(1);
  severityEl.className = `value severity-${severity}`;

  // Confidence
  const pct = Math.round((data.confidence ?? 0) * 100);
  confidenceEl.textContent = `${pct}%`;
  // Trigger CSS animation on next frame
  requestAnimationFrame(() => {
    confidenceBar.style.width = `${pct}%`;
  });

  // Categories
  categoriesEl.innerHTML = "";
  const cats = Array.isArray(data.categories) ? data.categories : [];
  if (cats.length === 0) {
    categoriesEl.innerHTML = '<span style="color:var(--text-muted);font-size:.85rem">None detected</span>';
  } else {
    cats.forEach((cat) => {
      const span = document.createElement("span");
      span.className = "category-tag";
      span.textContent = cat;
      categoriesEl.appendChild(span);
    });
  }

  // Summary
  summaryEl.textContent = data.summary ?? "";

  resultPanel.classList.add("visible");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  resultPanel.classList.remove("visible");

  const imageUrl = urlInput.value.trim();
  if (!imageUrl) {
    showError("Please enter an image URL before submitting.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.message || `Server error (${response.status}).`;
      showError(msg);
      return;
    }

    renderResult(data);
  } catch (err) {
    showError("Network error — could not reach the server. Please try again.");
  } finally {
    setLoading(false);
  }
});
