import { createApp } from './app'
import { checkDatabase, prisma } from './db'
import { env } from './env'
import { PrismaPlacementStore } from './placements/prisma-store'

const placementStore = new PrismaPlacementStore(prisma)

const app = createApp({
  checkDatabase,
  placementStore,
  corsOrigin: env.CORS_ORIGIN,
})

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})
