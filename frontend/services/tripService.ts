// All trip-related API calls live here
import { getToken } from "@/services/authService"

const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1`

// Build auth headers — adds Bearer token if logged in
function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type"  : "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  }
}

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`, {
    headers: authHeaders(),
  })
  return res.json()
}

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    headers: authHeaders(),
  })
  return res.json()
}

export async function generateTrip(data: any) {
  const res = await fetch(`${API_URL}/trips`, {
    method  : "POST",
    headers : authHeaders(),
    body    : JSON.stringify(data),
  })
  return res.json()
}

export async function deleteTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    method  : "DELETE",
    headers : authHeaders(),
  })
  return res.json()
}

export async function searchTrips(destination: string, travelStyle: string) {
  const params = new URLSearchParams()
  if (destination) params.append("destination", destination)
  if (travelStyle) params.append("travel_style", travelStyle)

  const res = await fetch(`${API_URL}/trips/search?${params.toString()}`, {
    headers: authHeaders(),
  })
  return res.json()
}
