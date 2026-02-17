import hashlib
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.config import settings
from app.redis_client import get_cached_summary, set_cached_summary

llm = ChatOpenAI(
    model="gpt-4",
    api_key=settings.OPENAI_API_KEY,
    temperature=0.3,
)

SUMMARY_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an expert at summarizing documents. Produce clear, concise summaries that capture the key points. Keep summaries under 300 words when possible."),
    ("human", "Summarize the following document:\n\n{document_text}"),
])

chain = SUMMARY_PROMPT | llm | StrOutputParser()


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]


async def summarize_text(text: str) -> str:
    if not text.strip():
        return ""
    doc_hash = _content_hash(text)
    cached = await get_cached_summary(doc_hash)
    if cached:
        return cached
    summary = await chain.ainvoke({"document_text": text[:12000]})  # limit context
    await set_cached_summary(doc_hash, summary)
    return summary
