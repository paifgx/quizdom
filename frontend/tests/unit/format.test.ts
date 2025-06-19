import { describe, it, expect } from 'vitest'
import { formatDisplayName, capitalize, formatDate } from '../../app/utils/format'

describe('formatDisplayName', () => {
  it('returns full name when both first and last name are provided', () => {
    expect(formatDisplayName('John', 'Doe')).toBe('John Doe')
  })

  it('returns first name when only first name is provided', () => {
    expect(formatDisplayName('John')).toBe('John')
  })

  it('returns username when names are not provided', () => {
    expect(formatDisplayName(undefined, undefined, 'johndoe123')).toBe('johndoe123')
  })

  it('returns "Anonymous User" when no information is provided', () => {
    expect(formatDisplayName()).toBe('Anonymous User')
  })
})

describe('capitalize', () => {
  it('capitalizes the first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
    expect(capitalize('hELLo WoRLd')).toBe('Hello world')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character strings', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('Z')).toBe('Z')
  })
})

describe('formatDate', () => {
  it('formats date objects correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toContain('2024')
    expect(formatted).toContain('Januar')
    expect(formatted).toContain('15')
  })

  it('formats date strings correctly', () => {
    const formatted = formatDate('2024-12-25')
    expect(formatted).toContain('2024')
    expect(formatted).toContain('Dezember')
    expect(formatted).toContain('25')
  })
}) 