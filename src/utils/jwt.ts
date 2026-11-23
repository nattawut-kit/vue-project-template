export interface DecodedJwt<TPayload = Record<string, unknown>> {
  header: Record<string, unknown>
  payload: TPayload
}

function decodeBase64Url(segment: string): string {
  const base64 = segment
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=')
  return atob(base64)
}

/** Decodes a JWT's header/payload without verifying its signature — trust the issuer, not this. */
export function decodeJwt<TPayload = Record<string, unknown>>(
  token: string,
): DecodedJwt<TPayload> | null {
  const [headerSegment, payloadSegment, signatureSegment] = token.split('.')
  if (!headerSegment || !payloadSegment || !signatureSegment) return null

  try {
    const header = JSON.parse(decodeBase64Url(headerSegment)) as Record<string, unknown>
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as TPayload
    return { header, payload }
  } catch {
    return null
  }
}
