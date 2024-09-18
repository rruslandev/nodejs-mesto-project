import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import { AuthRequest } from '../types'
import NotFoundError from '../errors/NotFoundError'
import BadRequestError from '../errors/BadRequestError'
import ConflictError from '../errors/ConflictError'
import UnauthorizedError from '../errors/UnauthorizedError'
import { MONGO_DUPLICATE_ERROR_CODE, OK } from '../constants'

const { JWT_SECRET = 'secret-key' } = process.env

// Получить всех пользователей
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(next)
}

// Получить текущего пользователя
export const getCurrentUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  User.findById(req.user?._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      res.status(OK).send(user)
    })
    .catch(next)
}

// Получить пользователя по ID
export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      res.status(OK).send(user)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID пользователя'))
      } else {
        next(err)
      }
    })
}

// Создать пользователя (регистрация)
export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при создании пользователя'))
      } else if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new ConflictError('Пользователь с таким email уже существует'))
      } else {
        next(err)
      }
    })
}

// Обновить профиль
export const updateProfile = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body

  User.findByIdAndUpdate(
    req.user?._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      res.status(OK).send(user)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при обновлении профиля'))
      } else {
        next(err)
      }
    })
}

// Обновить аватар
export const updateAvatar = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { avatar } = req.body

  User.findByIdAndUpdate(
    req.user?._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      res.status(OK).send(user)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при обновлении аватара'))
      } else {
        next(err)
      }
    })
}

// Авторизация пользователя
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль')
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль')
          }

          const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' })

          res.send({ token })
        })
    })
    .catch(next)
}
