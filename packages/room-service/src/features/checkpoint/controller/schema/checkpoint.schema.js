import {errorSchema} from "#errors";

const scoresSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            userId: { type: 'string' },
            score: { type: 'number' }
        }
    }
}

export const recoverSchema = {
    tags: ['Checkpoint'],
    summary: 'Reprise sur incident',
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
                roomId: { type: 'string' },
                questionId: { type: 'number' },
                scores: scoresSchema,
                message: { type: 'string' }
            }
        },
        404: errorSchema,
        500: errorSchema
    }
}