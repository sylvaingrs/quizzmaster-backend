export class RoomError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

export class NotFoundError extends RoomError {
    constructor(message) {
        super(message, 404)
    }
}

export class BadRequestError extends RoomError {
    constructor(message) {
        super(message, 400)
    }
}

export class ForbiddenError extends RoomError {
    constructor(message) {
        super(message, 403)
    }
}