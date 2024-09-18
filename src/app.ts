import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { celebrate, errors, Joi } from 'celebrate'
import cookieParser from 'cookie-parser'
import { requestLogger, errorLogger } from './middlewares/logger'
import userRoutes from './routes/users'
import cardRoutes from './routes/cards'
import { createUser, login } from './controllers/users'
import validateUrl from './utils/validateUrl'
import NotFoundError from './errors/NotFoundError'
import auth from './middlewares/auth'
import { INTERNAL_SERVER_ERROR } from './constants'

const { PORT = 3000 } = process.env

const app = express()

app.use(express.json())
app.use(cookieParser())

// Логгер запросов
app.use(requestLogger)

// Роуты без авторизации
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, helpers) => {
      if (validateUrl(value)) {
        return value
      }
      return helpers.message({ custom: 'Некорректный URL' })
    }),
  }),
}), createUser)

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login)

// Авторизация
app.use(auth)

// Роуты с авторизацией
app.use('/', userRoutes)
app.use('/', cardRoutes)

// Обработка несуществующих роутов
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Роут не найден'))
})

// Логгер ошибок
app.use(errorLogger)

// Обработчик ошибок celebrate
app.use(errors())

// Централизованный обработчик ошибок
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = INTERNAL_SERVER_ERROR, message } = err

  res.status(statusCode).send({
    message: statusCode === INTERNAL_SERVER_ERROR ? 'На сервере произошла ошибка' : message,
  })
})

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('Подключение к базе данных успешно')
    app.listen(PORT, () => {
      console.log(`Сервер работает на порту ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Ошибка подключения к базе данных', err)
  })
