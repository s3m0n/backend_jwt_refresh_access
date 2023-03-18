const db = require('../db')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const MailService = require('./mail-service')
const TokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const tokenService = require('./token-service')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        const candidate = await db.query('SELECT EXISTS (SELECT * FROM accounts WHERE email = $1)', [email])
        if(candidate.rows[0].exists) {
            throw ApiError.BadRequest('user with this email is already exists')
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const now = new Date()
        const sqlReq = 'INSERT INTO accounts (email, password, activationlink, created_on, last_login) values ($1, $2, $3, $4, $5) RETURNING *'
        const user = (await db.query(sqlReq, [email, hashPassword, activationLink, now, now])).rows[0]
        await MailService.send_activation_mail(email, activationLink)
        const userDto = new UserDto(user)
        const tokens = TokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }


    async updateLastActivity(id) {
        const now = new Date()
        await db.query('UPDATE accounts SET last_login = $1 WHERE id = $2', [now, id])
    }


    async activate(activationLink) {
        const user = await db.query('SELECT * FROM accounts WHERE activationlink = $1', [activationLink]);
        if(!user.rows[0]) {
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }
        await db.query('UPDATE accounts SET isactivated = $1 WHERE id = $2', [true, user.rows[0].id])
        await this.updateLastActivity(user.rows[0].id)
    }


    async login(email, password) {
        const user = await db.query('SELECT * FROM accounts WHERE email = $1', [email])
        if(!user.rows[0]) {
            throw ApiError.BadRequest('user with this email was not registrated')
        }
        const isPasswordEqual = bcrypt.compare(password, user.rows[0].password)
        if(!isPasswordEqual) {
            throw ApiError.BadRequest('Wrong password')
        }
        const userDto = new UserDto(user.rows[0])
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }


    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnathorizedError()
        }
        const userData = TokenService.validateRefreshToken(refreshToken)
        const dbToken = await TokenService.findToken(refreshToken)
        if(!userData || !dbToken) {
            throw ApiError.UnathorizedError()
        }
        const user = (await db.query('SELECT * FROM accounts WHERE id = $1', [userData.id])).rows[0]
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        await this.updateLastActivity(userDto.id)

        return {...tokens, user: userDto}
    }


    async getAllUsers() {
        const users = (await db.query('SELECT accounts.id, accounts.email, accounts.isactivated, accounts.created_on, accounts.last_login FROM accounts')).rows
        return users
    }

    async isActivated(id) {
        const res = (await db.query('SELECT accounts.isactivated FROM accounts WHERE id = $1', [id])).rows[0].isactivated
        return res
    }
}

module.exports = new UserService()