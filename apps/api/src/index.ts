import { createApp } from './app'
import { checkDatabase } from './db'
import { env } from './env'

const app = createApp({ checkDatabase, corsOrigin: env.CORS_ORIGIN })

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})
