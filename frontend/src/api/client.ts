const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function summarizeDocument(title: string, content: string) {
  const res = await fetch(`${API_BASE}/api/documents/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDocument(id: number) {
  const res = await fetch(`${API_BASE}/api/documents/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChatMessage(sessionId: string | null, message: string) {
  const res = await fetch(`${API_BASE}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function chatWebSocketUrl() {
  const base = import.meta.env.VITE_WS_URL || (typeof location !== "undefined" ? location.origin : "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/api/chat/ws`;
}
