import type { HealthResponse } from '@reclo/shared'
import cors from 'cors'
import express, { type Express } from 'express'

export interface AppDependencies {
  /** Rejects when the database cannot be reached. */
  checkDatabase: () => Promise<void>
  /** Origin allowed by CORS. Omit to disable CORS headers. */
  corsOrigin?: string
}

export function createApp({ checkDatabase, corsOrigin }: AppDependencies): Express {
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

  return app
}
