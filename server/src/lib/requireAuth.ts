import { fromNodeHeaders } from 'better-auth/node'
import type { Request, RequestHandler } from 'express'
import { auth, type Session } from '../auth.js'
import { HttpError } from './http.js'

declare global {
  namespace Express {
    interface Request {
      session?: Session
    }
  }
}

// Guard for app routes (game data in later phases); Better Auth's own routes handle themselves
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  if (!session) throw new HttpError(401, 'Not signed in')

  req.session = session
  next()
}

export const currentSession = (req: Request): Session => {
  if (!req.session) throw new HttpError(401, 'Not signed in')
  return req.session
}
