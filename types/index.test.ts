import { isAdmin, getUserRole } from './index'

describe('isAdmin', () => {
  it('returns true for admin user', () => {
    expect(isAdmin({ id: '1', name: 'Admin', email: 'a@b.com', role: 'admin' })).toBe(true)
  })

  it('returns false for regular user', () => {
    expect(isAdmin({ id: '1', name: 'User', email: 'u@b.com', role: 'user' })).toBe(false)
  })

  it('returns false when role is undefined', () => {
    expect(isAdmin({ id: '1', name: 'User', email: 'u@b.com' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('returns false for empty object', () => {
    expect(isAdmin({})).toBe(false)
  })
})

describe('getUserRole', () => {
  it('returns role for admin', () => {
    expect(getUserRole({ id: '1', name: 'Admin', email: 'a@b.com', role: 'admin' })).toBe('admin')
  })

  it('returns role for regular user', () => {
    expect(getUserRole({ id: '1', name: 'User', email: 'u@b.com', role: 'user' })).toBe('user')
  })

  it('returns undefined when no role', () => {
    expect(getUserRole({ id: '1', name: 'User', email: 'u@b.com' })).toBeUndefined()
  })

  it('returns undefined for null', () => {
    expect(getUserRole(null)).toBeUndefined()
  })
})
