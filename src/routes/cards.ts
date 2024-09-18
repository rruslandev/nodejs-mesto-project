import { Router } from 'express'
import { celebrate, Joi } from 'celebrate'
import {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} from '../controllers/cards'
import validateUrl from '../utils/validateUrl'

const router = Router()

router.get('/cards', getCards)

router.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().custom((value, helpers) => {
      if (validateUrl(value)) {
        return value
      }
      return helpers.message({ custom: 'Некорректный URL' })
    }),
  }),
}), createCard)

router.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), deleteCard)

router.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), likeCard)

router.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), dislikeCard)

export default router
