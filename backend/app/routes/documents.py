from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models import Document
from app.services.summarizer import summarize_text

router = APIRouter()


class SummarizeRequest(BaseModel):
    title: str
    content: str


class SummarizeResponse(BaseModel):
    id: int
    title: str
    summary: str
    created_at: str


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(
    body: SummarizeRequest,
    db: AsyncSession = Depends(get_db),
):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    summary = await summarize_text(body.content)
    doc = Document(title=body.title, content=body.content, summary=summary)
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return SummarizeResponse(
        id=doc.id,
        title=doc.title,
        summary=doc.summary or "",
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )


@router.get("", response_model=list[SummarizeResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.desc()).limit(50))
    docs = result.scalars().all()
    return [
        SummarizeResponse(
            id=d.id,
            title=d.title,
            summary=d.summary or "",
            created_at=d.created_at.isoformat() if d.created_at else "",
        )
        for d in docs
    ]


@router.get("/{doc_id}", response_model=SummarizeResponse)
async def get_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return SummarizeResponse(
        id=doc.id,
        title=doc.title,
        summary=doc.summary or "",
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )
