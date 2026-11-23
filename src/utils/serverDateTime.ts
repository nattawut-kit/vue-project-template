const HAS_TIMEZONE_PATTERN = /[Zz]$|[+-]\d{2}:?\d{2}$/
// The backend writes its own wall clock, which is Thailand's, not UTC.
const SERVER_UTC_OFFSET = '+07:00'

// A date time from the api carries no offset (`2026-05-11T10:43:12.345` or `2026-10-04 10:16:30`), and
// `new Date(...)` would read it as the device's own clock instead of the server's. This assumes the
// server's +07:00 whenever there is no offset. The space becomes a `T` because WebKit (LINE on iOS)
// refuses the space separated form.
export function parseServerDateTime(value: string): Date {
  const iso = value.replace(' ', 'T')
  return new Date(HAS_TIMEZONE_PATTERN.test(iso) ? iso : `${iso}${SERVER_UTC_OFFSET}`)
}
