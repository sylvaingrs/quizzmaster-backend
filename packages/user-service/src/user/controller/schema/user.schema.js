const errorSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

const roomActionResponseSchema = {
    type: 'object',
    properties: {
        roomId: { type: 'string' },
        pseudo: { type: 'string' },
        role: { type: 'string' }
    }
}

const roomSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        quizId: { type: 'number' },
        status: { type: 'string' },
        players: { type: 'array' }
    }
}

export const createRoomSchema = {
    tags: ['Room'],
    summary: 'Créer une room',
    body: {
        type: 'object',
        required: ['pseudo', 'quizId'],
        properties: {
            pseudo: { type: 'string' },
            quizId: { type: 'number' }
        }
    },
    response: {
        201: roomActionResponseSchema,
        400: errorSchema,
        500: errorSchema
    }
}

export const getRoomSchema = {
    tags: ['Room'],
    summary: 'Récupérer une room',
    params: {
        type: 'object',
        required: ['roomId'],
        properties: {
            roomId: { type: 'string' }
        }
    },
    response: {
        200: roomSchema,
        404: errorSchema,
        500: errorSchema
    }
}

export const joinRoomSchema = {
    tags: ['Room'],
    summary: 'Rejoindre une room',
    params: {
        type: 'object',
        required: ['roomId'],
        properties: {
            roomId: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['pseudo'],
        properties: {
            pseudo: { type: 'string' }
        }
    },
    response: {
        200: roomActionResponseSchema,
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
    }
}

export const gatewayUserSchema = {
    tags: ['Room'],
    summary: 'Proxy vers room-service',
    body: {
        type: 'object',
        required: ['data'],
        properties: {
            data: {}
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                status: { type: 'string' }
            }
        },
        400: errorSchema,
        500: errorSchema
    }
}