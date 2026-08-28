// All trip-related API calls live here
const API_URL = "http://localhost:8000/api/v1"

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`)
  return res.json()
}

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`)
  return res.json()
}

export async function generateTrip(data: any) {
  const res = await fetch(`${API_URL}/trips`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify(data)
  })
  return res.json()
}

export async function deleteTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`, { method: "DELETE" })
  return res.json()
}

export async function searchTrips(destination: string, travelStyle: string) {
  const params = new URLSearchParams()
  if (destination) params.append("destination", destination)
  if (travelStyle) params.append("travel_style", travelStyle)

  const res = await fetch(`${API_URL}/trips/search?${params.toString()}`)
  return res.json()
}