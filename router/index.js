const Router = require('express').Router
const userController = require('../controllers/user-controller')
const bodyParser = require('body-parser')
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')

const router = new Router()

router.post('/registration', bodyParser.json(), body('email').isEmail(), body('password').isLength({min: 3, max: 32}), userController.registration)
router.post('/login',  bodyParser.json(), userController.login)
router.post('/logout', bodyParser.json(), userController.logout)

router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/users', authMiddleware, userController.getUsers)

module.exports = router