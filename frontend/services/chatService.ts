import { getToken } from "@/services/authService"

const API_URL = "http://localhost:8000/api/v1"

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type"  : "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  }
}

// Create a new conversation and return its id
export async function createConversation(title: string = "New Conversation"): Promise<number> {
  const res = await fetch(`${API_URL}/conversations`, {
    method  : "POST",
    headers : authHeaders(),
    body    : JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error("Failed to create conversation")
  const data = await res.json()
  return data.conversation_id
}

// List all conversations for the logged-in user
export async function listConversations() {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to load conversations")
  return res.json()
}

// Load all messages for a conversation
export async function getMessages(conversationId: number) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to load messages")
  return res.json()
}

// Send a user message and get an AI reply
export async function sendMessage(conversationId: number, content: string, getReply: boolean = true) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method  : "POST",
    headers : authHeaders(),
    body    : JSON.stringify({ content, get_reply: getReply }),
  })
  if (!res.ok) throw new Error("Failed to send message")
  return res.json()
}

// Rename a conversation title
export async function updateConversationTitle(conversationId: number, title: string) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method  : "PATCH",
    headers : authHeaders(),
    body    : JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error("Failed to update title")
  return res.json()
}
