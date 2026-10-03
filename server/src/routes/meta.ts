import { Router } from 'express'
import { googleEnabled } from '../env.js'
import { currentSession, requireAuth } from '../lib/requireAuth.js'

export const metaRouter = Router()

metaRouter.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Public, non-secret settings the client needs before anyone signs in
metaRouter.get('/config', (_req, res) => {
  res.json({ googleEnabled })
})

// Example protected route: the pattern game routes will follow in later phases
metaRouter.get('/me', requireAuth, async (req, res) => {
  const { user } = currentSession(req)
  res.json({ user })
})
