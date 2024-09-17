import { Request, Response, NextFunction } from 'express'
import Card from '../models/card'
import { AuthContext } from '../types'
import { BAD_REQUEST, NOT_FOUND } from '../constants'

export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err))
}

export const createCard = (
  req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  const { name, link } = req.body
  const owner = res.locals.user?._id

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректные данные при создании карточки' })
      }
      return next(err)
    })
}

export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndDelete(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка не найдена' })
      }
      return res.send({ message: 'Карточка удалена' })
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректный ID карточки' })
      }
      return next(err)
    })
}

export const likeCard = (req: Request, res: Response<unknown, AuthContext>, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: res.locals.user?._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка не найдена' })
      }
      return res.send(card)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректный ID карточки' })
      }
      return next(err)
    })
}

export const dislikeCard = (
  req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: res.locals.user?._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка не найдена' })
      }
      return res.send(card)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Некорректный ID карточки' })
      }
      return next(err)
    })
}
