const errorSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

export const PlayerSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' }
    }
}

const roomResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        quizId: { type: 'number' },
        status: { type: 'string' },
        players: { type: 'array', items: PlayerSchema }
    }
}

const gameStepSchema = {
    type: 'object',
    properties: {
        room: { type: 'string' },
        finished: { type: 'boolean' },
        currentQuestion: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                timeLimit: { type: 'number' }
            }
        }
    }
}

export const createRoomSchema = {
    tags: ['Room'],
    summary: 'Créer une room',
    body: {
        type: 'object',
        required: ['quizId', 'gameMaster'],
        properties: {
            quizId: { type: 'number' },
            gameMaster: PlayerSchema
        }
    },
    response: {
        201: roomResponseSchema,
        400: errorSchema,
        500: errorSchema
    }
}

export const getRoomSchema = {
    tags: ['Room'],
    summary: 'Récupérer une room',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: roomResponseSchema,
        404: errorSchema,
        500: errorSchema
    }
}

export const startRoomSchema = {
    tags: ['Room'],
    summary: 'Démarrer la partie',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: gameStepSchema,
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
    }
}

export const nextQuestionSchema = {
    tags: ['Room'],
    summary: 'Question suivante',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: gameStepSchema,
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
    }
}

export const endRoomSchema = {
    tags: ['Room'],
    summary: 'Terminer la partie',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                room: { type: 'string' },
                status: { type: 'string' }
            }
        },
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
    }
}