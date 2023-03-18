require('dotenv').config()
const jwt = require('jsonwebtoken')
const db = require('../db')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch(e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch(e) {
            return null
        }
    }

    async saveToken(id, refreshToken) {
        const tokenData = (await db.query('SELECT EXISTS (SELECT * FROM token WHERE account = $1)', [id])).rows[0].exists
        if(tokenData) {
            return (await db.query('UPDATE token SET refreshtoken = $1 WHERE account = $2', [refreshToken, id])).rows[0]
        }
        return (await db.query('INSERT INTO token (account, refreshToken) VALUES ($1, $2) RETURNING *', [id, refreshToken])).rows[0]
    }

    async removeToken(refreshToken) {
        const tokenData = await db.query('DELETE FROM token WHERE refreshToken = $1 RETURNING *', [refreshToken])
        return tokenData.rows[0]
    }

    async findToken(refreshToken) {
        const tokenData = await db.query('SELECT * FROM token WHERE refreshtoken = $1', [refreshToken])
        return tokenData.rows[0].refreshtoken
    }
}

module.exports = new TokenService()