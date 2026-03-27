import {errorSchema} from "#errors";

export const buzzSchema = {
    tags: ['Buzzer'],
    summary: 'Buzzer',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {type: 'string'}
        }
    },
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: {type: 'string'}
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: {type: 'boolean'},
                userId: {type: 'string'},
            }
        },
        500: errorSchema
    }
}

export const answerSchema = {
    tags: ['Buzzer'],
    summary: 'Soumettre une réponse',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {type: 'string'}
        }
    },
    body: {
        type: 'object',
        required: ['userId', 'answer'],
        properties: {
            userId: {type: 'string'},
            answer: {type: 'string'}
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                correct: {type: 'boolean'},
                userId: {type: 'string'}
            }
        },
        400: errorSchema,
        404: errorSchema,
        500: errorSchema
    }
}