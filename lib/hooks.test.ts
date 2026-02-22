import { renderHook, waitFor, act } from '@testing-library/react'
import { useApiData } from './hooks'

describe('useApiData', () => {
  const mockData = { id: '1', name: 'Test Event' }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts in loading state with fallback data', () => {
    // Never resolves
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useApiData('/api/test', null))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches data successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() => useApiData('/api/test', null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('sets error on HTTP error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useApiData('/api/test', null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('HTTP 500')
    expect(result.current.data).toBeNull()
  })

  it('sets error on network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useApiData('/api/test', 'fallback'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.data).toBe('fallback')
  })

  it('handles non-Error rejection gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce('string error')

    const { result } = renderHook(() => useApiData('/api/test', []))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch')
  })

  it('uses fallback as initial data', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const fallback = [{ id: '1' }]
    const { result } = renderHook(() => useApiData('/api/test', fallback))

    expect(result.current.data).toEqual(fallback)
  })

  it('calls fetch with the correct URL', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    renderHook(() => useApiData('/api/contestants', []))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/contestants')
    })
  })

  it('provides a setData function to update data externally', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() => useApiData('/api/test', null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newData = { id: '2', name: 'Updated' }
    act(() => {
      result.current.setData(newData)
    })

    expect(result.current.data).toEqual(newData)
  })
})
