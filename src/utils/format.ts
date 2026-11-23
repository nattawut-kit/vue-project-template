import dayjs from 'dayjs'

// One place for the locale, every formatter below reads it.
const LOCALE = 'th-TH'
// dayjs has no Buddhist-era plugin, so a พ.ศ. year is offset by hand.
const BUDDHIST_ERA_OFFSET = 543

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat(LOCALE)

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value)
}

// "05 มี.ค. 2569"
export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date)
}

// "11/05/2569 10:49": day/month/full พ.ศ. year, a space, then the time.
export function formatDateTime(date: Date): string {
  const value = dayjs(date)
  return `${value.format('DD/MM')}/${value.year() + BUDDHIST_ERA_OFFSET} ${value.format('HH:mm')}`
}

export function formatInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

// Groups a 10-digit Thai mobile number as 081-234-5678. Anything shorter than 10 digits (or
// containing non-digit characters) is returned unchanged, it isn't a complete number to format.
export function formatPhoneNumber(phone: string): string {
  if (!/^\d{10}$/.test(phone)) return phone
  return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
}

// "0964672582" -> "096-XXX-2582": keeps the prefix and the last four digits so the user can
// recognise their number without the full thing on screen. Anything that isn't a complete
// 10-digit number is returned unchanged, like formatPhoneNumber.
export function maskPhoneNumber(phone: string): string {
  if (!/^\d{10}$/.test(phone)) return phone
  return `${phone.slice(0, 3)}-XXX-${phone.slice(6)}`
}
