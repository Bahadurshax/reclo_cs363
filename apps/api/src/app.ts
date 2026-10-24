import type { ApiError, HealthResponse } from '@reclo/shared'
import cors from 'cors'
import express, { type ErrorRequestHandler, type Express } from 'express'
import { createPlacementRouter } from './placements/routes'
import type { PlacementStore } from './placements/store'

export interface AppDependencies {
  /** Rejects when the database cannot be reached. */
  checkDatabase: () => Promise<void>
  /** Placements persistence. */
  placementStore?: PlacementStore
  /** Origin allowed by CORS. Omit to disable CORS headers. */
  corsOrigin?: string
}

export function createApp({ checkDatabase, placementStore, corsOrigin }: AppDependencies): Express {
  const app = express()

  if (corsOrigin) {
    app.use(cors({ origin: corsOrigin }))
  }
  app.use(express.json())

  app.get('/health', async (_req, res) => {
    try {
      await checkDatabase()
      res.json({ status: 'ok' } satisfies HealthResponse)
    } catch (error) {
      console.error('Health check failed: database unreachable', error)
      res.status(503).json({ status: 'error' } satisfies HealthResponse)
    }
  })

  if (placementStore) {
    app.use('/api/placements', createPlacementRouter({ store: placementStore }))
  }

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Malformed JSON' } satisfies ApiError)
      return
    }
    console.error('Unhandled error', error)
    res.status(500).json({ error: 'Something went wrong' } satisfies ApiError)
  }
  app.use(errorHandler)

  return app
}
