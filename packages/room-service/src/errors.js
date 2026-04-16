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

/**
 * @param {Error} error
 * @param {import('fastify').FastifyReply} reply
 */
export function handleError(error, reply) {
    if (error instanceof RoomError) {
        return reply.status(error.status).send({message: error.message})
    }
    return reply.status(500).send({message: 'Internal Server Error'})
}

export const errorSchema = {
    type: 'object',
    properties: {
        message: {type: 'string'}
    }
}