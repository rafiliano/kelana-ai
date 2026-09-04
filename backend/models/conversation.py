from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id         = Column(BigInteger, primary_key=True)
    user_id    = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title      = Column(String(256), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationship — one conversation has many messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    user     = relationship("User", back_populates="conversations")


class Message(Base):
    __tablename__ = "messages"

    id              = Column(BigInteger, primary_key=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role            = Column(String(16), nullable=False)   # "user" or "assistant"
    content         = Column(Text, nullable=False)
    created_at      = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationship — each message belongs to one conversation
    conversation = relationship("Conversation", back_populates="messages")
