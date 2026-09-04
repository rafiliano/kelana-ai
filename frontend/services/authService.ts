const API_URL = "http://localhost:8000/api/v1/auth"

// Save token to localStorage
export function saveToken(token: string) {
  localStorage.setItem("access_token", token)
}

// Get token from localStorage — only available in browser
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token")
}

// Remove token — used on logout
export function removeToken() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("user_name")
  localStorage.removeItem("user_email")
}

// Save user info for display
export function saveUserName(name: string) {
  localStorage.setItem("user_name", name)
}

export function saveUserEmail(email: string) {
  localStorage.setItem("user_email", email)
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_name")
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_email")
}

// Decode JWT payload without a library — just base64 decode the middle part
function decodeTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ?? null; // unix timestamp in seconds
  } catch {
    return null;
  }
}

// Check if user is logged in AND token is not expired
export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;

  const exp = decodeTokenExpiry(token);
  if (!exp) return false;

  // exp is in seconds, Date.now() is in milliseconds
  const isExpired = Date.now() / 1000 > exp;
  if (isExpired) {
    // Auto-clear stale token
    removeToken();
    return false;
  }

  return true;
}

// Fetch profile from backend
export async function fetchMe() {
  const token = getToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch("http://localhost:8000/api/v1/auth/me", {
    headers: { "Authorization": `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch profile")
  return res.json()
}

// Register a new account
export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/register`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Registration failed")
  }

  const data = await res.json()
  // Save name and email to localStorage right after register
  saveUserName(data.name)
  saveUserEmail(data.email)
  return data
}

// Login and store the token
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Login failed")
  }

  const data = await res.json()
  saveToken(data.access_token)
  return data
}
