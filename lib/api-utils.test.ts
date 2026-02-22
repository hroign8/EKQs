import { errorResponse, successResponse } from './api-utils'

// Mock the Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

describe('errorResponse', () => {
  it('returns JSON with error message and default 400 status', async () => {
    const res = errorResponse('Something went wrong')
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Something went wrong' })
  })

  it('returns JSON with custom status code', async () => {
    const res = errorResponse('Not Found', 404)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toEqual({ error: 'Not Found' })
  })

  it('returns JSON with 500 status for server errors', async () => {
    const res = errorResponse('Internal Server Error', 500)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({ error: 'Internal Server Error' })
  })
})

describe('successResponse', () => {
  it('returns JSON data with default 200 status', async () => {
    const data = { id: '1', name: 'Test' }
    const res = successResponse(data)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(data)
  })

  it('returns JSON with custom 201 status', async () => {
    const data = { created: true }
    const res = successResponse(data, 201)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body).toEqual(data)
  })

  it('handles array data', async () => {
    const data = [{ id: '1' }, { id: '2' }]
    const res = successResponse(data)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(data)
  })

  it('handles null data', async () => {
    const res = successResponse(null)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toBeNull()
  })

  it('handles string data', async () => {
    const res = successResponse('ok')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toBe('ok')
  })
})
