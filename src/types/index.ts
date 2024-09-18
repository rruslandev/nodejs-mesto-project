import { Request } from 'express'

export interface UserPayload {
  _id: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface AuthContext {
  user?: UserPayload;
}
