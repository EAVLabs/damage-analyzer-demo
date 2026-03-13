const { useState } = React;

const LOGO_DARK_BG = "https://i.ibb.co/3yqTZ5zn/White-Logo-House-with-text-3.png";

const SEVERITY_COLORS = {
  none:     "var(--severity-none)",
  minor:    "var(--severity-minor)",
  moderate: "var(--severity-moderate)",
  severe:   "var(--severity-severe)",
  critical: "var(--severity-critical)",
};

/* ── Spinner ── */
function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

/* ── Category tag ── */
function Tag({ label }) {
  return <span className="category-tag">{label}</span>;
}

/* ── Confidence bar ── */
function ConfidenceBar({ pct }) {
  return (
    <div className="confidence-bar-wrap" role="progressbar"
         aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"
         aria-label={`Confidence ${pct}%`}>
      <div className="confidence-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Result panel ── */
function ResultPanel({ report }) {
  const pct = Math.round(report.confidence ?? 0);
  // const pct = Math.round((report.confidence ?? 0) * 100);
  const sev = report.severity ?? "unknown";
  const severityColor = SEVERITY_COLORS[sev] ?? "var(--text)";

  return (
    <section className="result-panel" aria-label="Damage report">
      <h2 className="section-label">Report</h2>

      <div className="result-grid">
        <div className="result-item">
          <div className="result-item-label">Severity</div>
          <div className="result-item-value" style={{ color: severityColor }}>
            {sev.charAt(0).toUpperCase() + sev.slice(1)}
          </div>
        </div>

        <div className="result-item">
          <div className="result-item-label">Confidence</div>
          <div className="result-item-value">{pct}%</div>
          <ConfidenceBar pct={pct} />
        </div>

        <div className="result-item full-width">
          <div className="result-item-label">Damage Categories</div>
          <div className="categories-wrap">
            {report.categories && report.categories.length > 0
              ? report.categories.map(cat => <Tag key={cat} label={cat} />)
              : <span className="text-muted">None detected</span>}
          </div>
        </div>
      </div>

      <div className="summary-box">{report.summary}</div>
    </section>
  );
}

/* ── Single image form ── */
function SingleForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setReport(null);

    const url = imageUrl.trim();
    if (!url) {
      setError("Please enter an image URL before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? `Server error (${res.status}).`);
        return;
      }

      setReport(data);
    } catch {
      setError("Network error — could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="image-url">Image URL</label>
          <input
            id="image-url"
            type="url"
            className="form-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            autoComplete="off"
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          className={`btn-primary${loading ? " btn-loading" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? <span className="btn-inner"><Spinner />Analyzing…</span>
            : "Analyze Image"}
        </button>
      </form>

      {error && (
        <div className="error-panel" role="alert" aria-live="assertive">{error}</div>
      )}

      {report && <ResultPanel report={report} />}
    </>
  );
}

/* ── Batch form ── */
function BatchForm() {
  const [urlsText, setUrlsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResults(null);

    const parsed = urlsText.split("\n").map(u => u.trim()).filter(Boolean);
    if (parsed.length === 0) {
      setError("Enter at least one image URL.");
      return;
    }

    setLoading(true);
    setUrls(parsed);
    try {
      const res = await fetch("/analyze-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: parsed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? `Server error (${res.status}).`);
        return;
      }

      setResults(data.results);
    } catch {
      setError("Network error — could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="image-urls">
            Image URLs — one per line
          </label>
          <textarea
            id="image-urls"
            className="form-input form-textarea"
            value={urlsText}
            onChange={e => setUrlsText(e.target.value)}
            placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
            rows={4}
          />
        </div>

        <button
          type="submit"
          className={`btn-primary${loading ? " btn-loading" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? <span className="btn-inner"><Spinner />Analyzing…</span>
            : "Analyze Batch"}
        </button>
      </form>

      {error && (
        <div className="error-panel" role="alert" aria-live="assertive">{error}</div>
      )}

      {results && results.length === 0 && (
        <div className="error-panel" role="status">
          No results returned. The batch endpoint may not be implemented yet.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="batch-results">
          {results.map((report, i) => (
            <div key={i} className="batch-result-item">
              <div className="batch-result-url">{urls[i]}</div>
              <ResultPanel report={report} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Main app ── */
function App() {
  const [mode, setMode] = useState("single");

  return (
    <>
      <nav className="navbar" role="banner">
        <img src={LOGO_DARK_BG} alt="Tracker logo" className="navbar-logo" />
      </nav>

      <main className="page-content">
        <header className="page-header">
          <h1 className="page-title">Damage Analyzer</h1>
          <p className="page-subtitle">
            Submit an image URL to receive a structured damage report.
          </p>
        </header>

        <div className="card">
          <div className="mode-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "single"}
              className={`mode-btn${mode === "single" ? " active" : ""}`}
              onClick={() => setMode("single")}
            >
              Single
            </button>
            <button
              role="tab"
              aria-selected={mode === "batch"}
              className={`mode-btn${mode === "batch" ? " active" : ""}`}
              onClick={() => setMode("batch")}
            >
              Batch
            </button>
          </div>

          {mode === "single" ? <SingleForm /> : <BatchForm />}
        </div>
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
