from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

from app.config import settings

llm = ChatOpenAI(
    model="gpt-4",
    api_key=settings.OPENAI_API_KEY,
    temperature=0.7,
)

CHAT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant for document review. Answer questions clearly and concisely. If the user shares document content or context, use it to inform your answers."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])


async def get_chat_response(user_message: str, history: list[dict]) -> str:
    messages = []
    for m in history[-10:]:  # last 10 turns
        if m["role"] == "user":
            messages.append(HumanMessage(content=m["content"]))
        else:
            messages.append(AIMessage(content=m["content"]))
    chain = CHAT_PROMPT | llm
    result = await chain.ainvoke({
        "history": messages,
        "input": user_message,
    })
    return result.content
