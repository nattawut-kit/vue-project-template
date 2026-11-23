const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// A text that is put into a string of HTML (a popup that renders its content as HTML) has to be
// escaped first, or a name like `แก้ว <Limited>` loses its tag and `A&amp;B` turns into `A&B`.
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]!)
}
