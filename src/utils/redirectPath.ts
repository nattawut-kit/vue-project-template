// "/" is the landing page itself — the page that runs the login — so a redirect to it leads nowhere
// and would leave the app on a blank screen.
export function isRootPath(path: string): boolean {
  return new URL(path, 'http://localhost').pathname === '/'
}

// decodeURIComponent throws a URIError on malformed input (e.g. a truncated %E0), which would crash
// the landing page's setup — a value that can't be decoded is simply ignored instead.
export function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

// Accepts only an in-app path (`/profile` or `profile`) and rejects anything that could leave the app
// or lead back to the landing page. Returns null when the value should be ignored.
export function normalizeRedirectPath(raw: string): string | null {
  const decoded = safeDecode(raw)
  if (!decoded) return null

  const path = decoded.startsWith('/') ? decoded : `/${decoded}`

  // A single leading "/" only — the next char must not be "/" or "\" (protocol-relative URLs like
  // //evil.com, and backslashes some browsers normalize to "/") to avoid an open redirect.
  if (!/^\/(?!\/|\\)/.test(path)) return null

  return isRootPath(path) ? null : path
}
