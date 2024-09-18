import { Router } from 'express'
import { celebrate, Joi } from 'celebrate'
import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} from '../controllers/users'
import validateUrl from '../utils/validateUrl'

const router = Router()

router.get('/users', getUsers)
router.get('/users/me', getCurrentUser)
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById)

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateProfile)

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, helpers) => {
      if (validateUrl(value)) {
        return value
      }
      return helpers.message({ custom: 'Некорректный URL' })
    }),
  }),
}), updateAvatar)

export default router
