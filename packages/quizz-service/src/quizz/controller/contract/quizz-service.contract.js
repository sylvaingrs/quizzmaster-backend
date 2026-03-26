export const createQuizzSchema = {
    tags: ['Quizz'],
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: {type: 'string'},
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: {type: 'integer'},
                title: {type: 'string'},
            }
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }
}

export const getQuizzSchema = {
    tags: ['Quizz'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id:    { type: 'integer' },
                title: { type: 'string' },
            },
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }
}

export const getAllQuizzSchema = {
    tags: ['Quizz'],
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id:    { type: 'integer' },
                    title: { type: 'string' },
                },
            },
        },
    },
}

export const deleteQuizzSchema = {
    tags: ['Quizz'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id:    { type: 'integer' },
                title: { type: 'string' },
            },
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }
}