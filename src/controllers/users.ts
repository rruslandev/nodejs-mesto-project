import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import { AuthContext } from '../types'
import { BAD_REQUEST, NOT_FOUND, OK } from '../constants'

const { JWT_SECRET = 'secret-key' } = process.env

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch((err) => next(err))
}

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь не найден' })
      }
      return res.send(user)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректный ID пользователя' })
      }
      return next(err)
    })
}

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar } = req.body
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректные данные при создании пользователя' })
      }
      return next(err)
    })
}

export const updateProfile = (
  req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  const { name, about } = req.body
  const userId = res.locals.user?._id

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь не найден' })
      }
      return res.send(user)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректные данные при обновлении профиля' })
      }
      return next(err)
    })
}

export const updateAvatar = (
  req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  const { avatar } = req.body
  const userId = res.locals.user?._id

  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь не найден' })
      }
      return res.send(user)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректные данные при обновлении аватара' })
      }
      return next(err)
    })
}
