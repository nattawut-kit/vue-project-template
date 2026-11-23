import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  formatDateTime,
  formatDecimal,
  formatInitials,
  formatPhoneNumber,
  formatShortDate,
  maskPhoneNumber,
} from '@/utils/format'

describe('formatCurrency', () => {
  it('formats as whole-baht THB currency', () => {
    expect(formatCurrency(1234)).toBe('฿1,234')
  })

  it('rounds off fractional baht', () => {
    expect(formatCurrency(1234.56)).toBe('฿1,235')
  })
})

describe('formatDecimal', () => {
  it('groups thousands with a comma', () => {
    expect(formatDecimal(1234567)).toBe('1,234,567')
  })
})

describe('formatShortDate', () => {
  it('formats as day, short month, พ.ศ. year', () => {
    expect(formatShortDate(new Date('2026-03-05'))).toBe('05 มี.ค. 2569')
  })
})

describe('formatDateTime', () => {
  it('formats as dd/mm/YYYY (พ.ศ.) HH:mm', () => {
    expect(formatDateTime(new Date(2026, 4, 11, 10, 49))).toBe('11/05/2569 10:49')
  })

  it('pads a single-digit day, month, hour and minute', () => {
    expect(formatDateTime(new Date(2026, 0, 1, 9, 5))).toBe('01/01/2569 09:05')
  })
})

describe('formatInitials', () => {
  it('keeps at most two initials', () => {
    expect(formatInitials('Araya Wongsakul Chai')).toBe('AW')
  })

  it('handles a single name', () => {
    expect(formatInitials('Mei')).toBe('M')
  })
})

describe('formatPhoneNumber', () => {
  it('groups a 10-digit number as 081-234-5678', () => {
    expect(formatPhoneNumber('0812345678')).toBe('081-234-5678')
  })

  it('returns a shorter, still-typed number unchanged', () => {
    expect(formatPhoneNumber('081234')).toBe('081234')
  })

  it('returns a non-numeric value unchanged', () => {
    expect(formatPhoneNumber('081-234-5678')).toBe('081-234-5678')
  })
})

describe('maskPhoneNumber', () => {
  it('hides the middle three digits', () => {
    expect(maskPhoneNumber('0964672582')).toBe('096-XXX-2582')
  })

  it('returns an incomplete number unchanged', () => {
    expect(maskPhoneNumber('096467')).toBe('096467')
  })

  it('returns an already formatted number unchanged', () => {
    expect(maskPhoneNumber('096-467-2582')).toBe('096-467-2582')
  })
})
