import { getToken } from "@/services/authService"

const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1`

export async function askQuestion(question: string) {
  const token = getToken()
  const res   = await fetch(`${API_URL}/ask`, {
    method  : "POST",
    headers : {
      "Content-Type"  : "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body    : JSON.stringify({ question }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to ask question")
  }

  return res.json()
}
