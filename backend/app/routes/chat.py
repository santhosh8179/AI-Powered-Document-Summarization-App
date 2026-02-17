import json
import uuid
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, AsyncSessionLocal
from app.models import ChatMessage
from app.services.chat import get_chat_response

router = APIRouter()


@router.post("/message")
async def send_message(
    body: dict,  # { "session_id": str, "message": str }
    db: AsyncSession = Depends(get_db),
):
    session_id = body.get("session_id") or str(uuid.uuid4())
    message = (body.get("message") or "").strip()
    if not message:
        return {"session_id": session_id, "reply": "", "error": "Empty message"}

    # Load history from DB
    from sqlalchemy import select
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    rows = result.scalars().all()
    history = [{"role": m.role, "content": m.content} for m in rows]

    reply = await get_chat_response(message, history)

    # Persist user and assistant messages
    user_msg = ChatMessage(session_id=session_id, role="user", content=message)
    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=reply)
    db.add(user_msg)
    db.add(assistant_msg)

    return {"session_id": session_id, "reply": reply}


@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    session_id = str(uuid.uuid4())
    history: list[dict] = []

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            message = (payload.get("message") or "").strip()
            if not message:
                await websocket.send_json({"reply": "Please send a non-empty message."})
                continue

            reply = await get_chat_response(message, history)
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": reply})

            await websocket.send_json({
                "session_id": session_id,
                "reply": reply,
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
