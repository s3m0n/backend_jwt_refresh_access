module.exports = class ApiError extends Error {
    status
    errors

    constructor(status, message, error){
        super(message)
        this.status = status
        this.error = error
    }

    static UnathorizedError() {
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors)
    }

    static notActivatedUser() {
        return new ApiError(403, 'Не подтвержден email адрес')
    }
}