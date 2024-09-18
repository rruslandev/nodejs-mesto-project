import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { AuthRequest } from '../types'
import UnauthorizedError from '../errors/UnauthorizedError'

const { JWT_SECRET = 'secret-key' } = process.env

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация')
  }

  const token = authorization.replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { _id: string }
    req.user = { _id: payload._id }
    next()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    next(new UnauthorizedError('Необходима авторизация'))
  }
}

export default auth
