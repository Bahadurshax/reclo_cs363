import type { MapBoundsQuery, PlacementMarker } from '@reclo/shared'

export interface PlacementStore {
  findMapMarkers: (query: MapBoundsQuery) => Promise<PlacementMarker[]>
}
