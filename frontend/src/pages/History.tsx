import { useState, useEffect } from "react";
import { listDocuments } from "../api/client";
import "./History.css";

type Doc = { id: number; title: string; summary: string; created_at: string };

export default function History() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="history-page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="history-page"><p className="error">{error}</p></div>;

  return (
    <div className="history-page">
      <header className="page-header">
        <h1>Summary History</h1>
        <p>Previously summarized documents. Cached for fast access.</p>
      </header>
      {docs.length === 0 ? (
        <p className="muted">No documents yet. Summarize something from the Summarize page.</p>
      ) : (
        <ul className="doc-list">
          {docs.map((d) => (
            <li key={d.id} className="doc-card">
              <h3>{d.title || "Untitled"}</h3>
              <p className="doc-summary">{d.summary}</p>
              <time className="doc-time">{new Date(d.created_at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
