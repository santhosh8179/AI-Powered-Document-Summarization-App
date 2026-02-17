import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/client";
import "./Chat.css";

type Message = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const data = await sendChatMessage(sessionId, text);
      if (data.session_id) setSessionId(data.session_id);
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get reply.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="page-header">
        <h1>AI Chat</h1>
        <p>Ask questions about your documents or get help with review. Real-time responses.</p>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-placeholder">
              Send a message to start. You can ask for clarification on summaries or document review tips.
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <span className="bubble-role">{msg.role === "user" ? "You" : "AI"}</span>
              <div className="bubble-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant">
              <span className="bubble-role">AI</span>
              <div className="bubble-content typing">Thinking…</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="chat-error">{error}</p>}
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
