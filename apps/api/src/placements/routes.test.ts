import type { MapBoundsQuery, PlacementMarker } from '@reclo/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app'
import type { PlacementStore } from './store'

const sampleMarker: PlacementMarker = {
  id: 'b1e0696a-54c3-4d40-84c4-f2a89326e680',
  title: 'Amir Temur Billboard',
  type: 'BILLBOARD',
  status: 'ACTIVE',
  latitude: 41.311,
  longitude: 69.279,
  address: 'Amir Temur Ave 10',
  city: 'Tashkent',
  pricePerMonth: 5_000_000,
  photo: 'https://example.com/photo.jpg',
}

function createTestApp(storeOverride?: Partial<PlacementStore>) {
  const store: PlacementStore = {
    findMapMarkers: vi.fn().mockResolvedValue([sampleMarker]),
    ...storeOverride,
  }

  const app = createApp({
    checkDatabase: vi.fn().mockResolvedValue(undefined),
    placementStore: store,
  })

  return { app, store }
}

describe('GET /api/placements/map', () => {
  it('returns 400 when required bounds query parameters are missing', async () => {
    const { app } = createTestApp()

    const res = await request(app).get('/api/placements/map')

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid query parameters')
    expect(res.body.fieldErrors).toHaveProperty('minLat')
    expect(res.body.fieldErrors).toHaveProperty('maxLat')
    expect(res.body.fieldErrors).toHaveProperty('minLng')
    expect(res.body.fieldErrors).toHaveProperty('maxLng')
  })

  it('returns 400 when coordinates are out of valid range', async () => {
    const { app } = createTestApp()

    const res = await request(app).get('/api/placements/map').query({
      minLat: -95,
      maxLat: 45,
      minLng: 60,
      maxLng: 200,
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid query parameters')
    expect(res.body.fieldErrors).toHaveProperty('minLat')
    expect(res.body.fieldErrors).toHaveProperty('maxLng')
  })

  it('returns 400 when minLat is greater than maxLat', async () => {
    const { app } = createTestApp()

    const res = await request(app).get('/api/placements/map').query({
      minLat: 42,
      maxLat: 40,
      minLng: 68,
      maxLng: 70,
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid query parameters')
    expect(res.body.fieldErrors).toHaveProperty('minLat')
  })

  it('returns 400 when minLng is greater than maxLng', async () => {
    const { app } = createTestApp()

    const res = await request(app).get('/api/placements/map').query({
      minLat: 40,
      maxLat: 42,
      minLng: 72,
      maxLng: 68,
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid query parameters')
    expect(res.body.fieldErrors).toHaveProperty('minLng')
  })

  it('returns 200 and markers when valid bounds are supplied', async () => {
    const { app, store } = createTestApp()

    const res = await request(app).get('/api/placements/map').query({
      minLat: 41.2,
      maxLat: 41.4,
      minLng: 69.1,
      maxLng: 69.4,
    })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      markers: [sampleMarker],
      total: 1,
    })
    expect(store.findMapMarkers).toHaveBeenCalledWith<[MapBoundsQuery]>({
      minLat: 41.2,
      maxLat: 41.4,
      minLng: 69.1,
      maxLng: 69.4,
    })
  })

  it('passes optional filters (type, city, minPrice, maxPrice) to store', async () => {
    const { app, store } = createTestApp()

    const res = await request(app).get('/api/placements/map').query({
      minLat: 41.0,
      maxLat: 42.0,
      minLng: 69.0,
      maxLng: 70.0,
      type: 'BILLBOARD',
      city: 'Tashkent',
      minPrice: 1_000_000,
      maxPrice: 10_000_000,
    })

    expect(res.status).toBe(200)
    expect(store.findMapMarkers).toHaveBeenCalledWith<[MapBoundsQuery]>({
      minLat: 41.0,
      maxLat: 42.0,
      minLng: 69.0,
      maxLng: 70.0,
      type: 'BILLBOARD',
      city: 'Tashkent',
      minPrice: 1_000_000,
      maxPrice: 10_000_000,
    })
  })

  it('returns 500 when store throws an unexpected error', async () => {
    const { app } = createTestApp({
      findMapMarkers: vi.fn().mockRejectedValue(new Error('Database error')),
    })

    const res = await request(app).get('/api/placements/map').query({
      minLat: 41.2,
      maxLat: 41.4,
      minLng: 69.1,
      maxLng: 69.4,
    })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({
      error: 'Failed to query map markers',
    })
  })
})
