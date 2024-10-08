import { UNAUTHORIZED } from '../constants'

export default class UnauthorizedError extends Error {
  statusCode: number

  constructor(message: string) {
    super(message)
    this.statusCode = UNAUTHORIZED
  }
}
