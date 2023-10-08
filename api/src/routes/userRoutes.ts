import express from 'express'
import multer from 'multer'
import routeNames from '../config/userRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as userController from '../controllers/userController'

const routes = express.Router()

routes.route(routeNames.signup).post(userController.signup)
routes.route(routeNames.adminSignup).post(userController.adminSignup)
routes.route(routeNames.create).post(authJwt.verifyToken, userController.create)
routes.route(routeNames.checkToken).get(userController.checkToken)
routes.route(routeNames.deleteTokens).delete(userController.deleteTokens)
routes.route(routeNames.resend).post(userController.resend)
routes.route(routeNames.activate).post(userController.activate)
routes.route(routeNames.signin).post(userController.signin)
routes.route(routeNames.signout).post(userController.signout)
routes.route(routeNames.pushToken).get(authJwt.verifyToken, userController.pushToken)
routes.route(routeNames.createPushToken).post(authJwt.verifyToken, userController.createPushToken)
routes.route(routeNames.deletePushToken).post(authJwt.verifyToken, userController.deletePushToken)
routes.route(routeNames.validateEmail).post(userController.validateEmail)
routes.route(routeNames.validateAccessToken).post(authJwt.verifyToken, userController.validateAccessToken)
routes.route(routeNames.confirmEmail).get(userController.confirmEmail)
routes.route(routeNames.resendLink).post(authJwt.verifyToken, userController.resendLink)
routes.route(routeNames.update).post(authJwt.verifyToken, userController.update)
routes.route(routeNames.updateEmailNotifications).post(authJwt.verifyToken, userController.updateEmailNotifications)
routes.route(routeNames.updateLanguage).post(authJwt.verifyToken, userController.updateLanguage)
routes.route(routeNames.getUser).get(authJwt.verifyToken, userController.getUser)
routes.route(routeNames.createAvatar).post([authJwt.verifyToken, multer({ storage: multer.memoryStorage() }).single('image')], userController.createAvatar)
routes.route(routeNames.updateAvatar).post([authJwt.verifyToken, multer({ storage: multer.memoryStorage() }).single('image')], userController.updateAvatar)
routes.route(routeNames.deleteAvatar).post(authJwt.verifyToken, userController.deleteAvatar)
routes.route(routeNames.deleteTempAvatar).post(authJwt.verifyToken, userController.deleteTempAvatar)
routes.route(routeNames.changePassword).post(authJwt.verifyToken, userController.changePassword)
routes.route(routeNames.checkPassword).get(authJwt.verifyToken, userController.checkPassword)
routes.route(routeNames.getUsers).post(authJwt.verifyToken, userController.getUsers)
routes.route(routeNames.delete).post(authJwt.verifyToken, userController.deleteUsers)

export default routes
