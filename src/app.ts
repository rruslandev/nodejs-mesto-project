import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import userRoutes from './routes/users'
import cardRoutes from './routes/cards'
import { AuthContext } from './types'
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from './constants'

const app = express()
const PORT = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Сервер запущен!')
})

app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`)
})

mongoose.connect('mongodb://localhost:27017/mestodb', {})
  .then(() => {
    console.log('Подключение к базе данных успешно')
  })
  .catch((err) => {
    console.error('Ошибка подключения к базе данных', err)
  })

app.use((req: Request, res: Response<unknown, AuthContext>, next: NextFunction) => {
  res.locals.user = {
    _id: '65ce3b5af85c5bc50f2b202c',
  }
  next()
})

app.use('/', userRoutes)
app.use('/', cardRoutes)

app.use((req: Request, res: Response) => {
  res.status(NOT_FOUND).send({ message: 'Роут не найден' })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR
  const message = statusCode === INTERNAL_SERVER_ERROR ? 'На сервере произошла ошибка' : err.message
  res.status(statusCode).send({ message })
})
