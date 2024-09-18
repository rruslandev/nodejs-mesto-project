import { BAD_REQUEST } from '../constants'

export default class BadRequestError extends Error {
  statusCode: number

  constructor(message: string) {
    super(message)
    this.statusCode = BAD_REQUEST
  }
}
