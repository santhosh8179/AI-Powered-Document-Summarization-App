import { useState } from "react";
import { summarizeDocument } from "../api/client";
import "./Summarize.css";

export default function Summarize() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSummary("");
    if (!content.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }
    setLoading(true);
    try {
      const data = await summarizeDocument(title || "Untitled", content);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="summarize-page">
      <header className="page-header">
        <h1>Document Summarization</h1>
        <p>Paste your document below. AI will generate a concise summary in seconds.</p>
      </header>

      <form onSubmit={handleSubmit} className="summarize-form">
        <div className="field">
          <label htmlFor="title">Title (optional)</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
          />
        </div>
        <div className="field">
          <label htmlFor="content">Document content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type your document here..."
            rows={12}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Summarizing…" : "Summarize with AI"}
        </button>
      </form>

      {summary && (
        <section className="summary-section">
          <h2>Summary</h2>
          <div className="summary-box">{summary}</div>
        </section>
      )}
    </div>
  );
}
