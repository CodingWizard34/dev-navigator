// On localhost, point to local FastAPI server (http://127.0.0.1:8000)
// In production browser, use relative path "" so requests proxy through Next.js edge rewrites without CORS or ad-blocker interference
export const API_BASE_URL =
  typeof window !== "undefined"
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000")
        : "")
    : (process.env.NEXT_PUBLIC_API_URL || "https://dev-navigator.onrender.com");

