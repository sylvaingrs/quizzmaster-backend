import {errorSchema} from "#errors";

export const roomScoreSchema = {
    tags: ['Score'],
    params: {
        type: 'object',
        required: ['roomid'],
        properties: {
            roomid: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                roomId:     { type: 'string' },
                questionId: { type: 'integer' },
                quizId:     { type: 'integer' },
                scores:     { type: 'object', additionalProperties: true },
                createdAt:  { type: 'string', format: 'date-time' },
                updatedAt:  { type: 'string', format: 'date-time' },
                quiz: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' }
                    }
                },
                question: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' }
                    }
                }
            },
        },
        400: errorSchema,
        404: errorSchema,
        500: errorSchema,
    }
}