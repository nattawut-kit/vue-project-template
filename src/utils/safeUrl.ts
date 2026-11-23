// A backend-supplied URL goes into an href — only http(s) may through, so a `javascript:` or `data:`
// value can never run when tapped.
export function toSafeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
