import { Request, Response, NextFunction } from 'express'
import Card from '../models/card'
import { AuthRequest } from '../types'
import BadRequestError from '../errors/BadRequestError'
import NotFoundError from '../errors/NotFoundError'
import ForbiddenError from '../errors/ForbiddenError'
import { CREATED, OK } from '../constants'

// Получить все карточки
export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(OK).send(cards))
    .catch(next)
}

// Создать карточку
export const createCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body
  const owner = req.user?._id

  Card.create({ name, link, owner })
    .then((card) => card.populate('owner'))
    .then((card) => res.status(CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при создании карточки'))
      } else {
        next(err)
      }
    })
}

// Удалить карточку
export const deleteCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id

  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена')
      }
      if (card.owner.toString() !== userId) {
        throw new ForbiddenError('Нет прав для удаления этой карточки')
      }
      return card.deleteOne()
    })
    .then(() => res.status(OK).send({ message: 'Карточка удалена' }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID карточки'))
      } else {
        next(err)
      }
    })
}

// Поставить лайк
export const likeCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user?._id } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена')
      }
      res.status(OK).send(card)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID карточки'))
      } else {
        next(err)
      }
    })
}

// Убрать лайк
export const dislikeCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user?._id } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена')
      }
      res.status(OK).send(card)
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID карточки'))
      } else {
        next(err)
      }
    })
}
