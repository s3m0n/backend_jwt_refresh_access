const ApiError = require('../exceptions/api-error')
const db = require('../db')
const TokenService = require('../service/token-service')
const UserService = require('../service/user-service')
const { isActivated } = require('../service/user-service')

module.exports = async function(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization
        if(!authorizationHeader) {
            return next(ApiError.UnathorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]
        if(!accessToken) {
            return next(ApiError.UnathorizedError())
        }

        const userData = TokenService.validateAccessToken(accessToken)
        if(!userData) {
            return next(ApiError.UnathorizedError())
        }

        await UserService.updateLastActivity(userData.id)
        const isactivated = await UserService.isActivated(userData.id)

        if(isactivated) {
            req.user = userData
            next()
        } else {
            return next(ApiError.notActivatedUser())
        }
    } catch (e) {
        return next(ApiError.UnathorizedError())
    }
}