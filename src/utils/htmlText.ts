// The survey back office stores labels and signed image URLs HTML-escaped (`&nbsp;`, `&amp;`), so
// they have to be decoded before they are shown or requested, an `&amp;` left in a signed URL
// breaks its signature.
export function decodeHtmlText(value: string | null): string {
  if (!value) return ''
  const doc = new DOMParser().parseFromString(value, 'text/html')
  return (doc.documentElement.textContent ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
}

export function decodeHtmlUrl(value: string | null): string | null {
  if (!value) return null
  return value.replace(/&amp;/g, '&')
}
