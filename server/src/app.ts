import { toNodeHandler } from 'better-auth/node'
import express from 'express'
import { auth } from './auth.js'
import { errorHandler } from './lib/http.js'
import { metaRouter } from './routes/meta.js'

export const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1) // so rate limiting sees real client IPs behind the Vite proxy / host proxy

// Better Auth parses its own request bodies, so it must be mounted before express.json()
app.all('/api/auth/{*splat}', toNodeHandler(auth))

app.use(express.json())
app.use('/api', metaRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})
app.use(errorHandler)
