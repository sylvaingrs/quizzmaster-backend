import {errorSchema} from "#errors";

export const getLeaderboardSchema = {
    tags: ['Leaderboard'],
    summary: 'Récupérer le leaderboard',
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
                leaderboard: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            userId: { type: 'string' },
                            score: { type: 'number' }
                        }
                    }
                }
            }
        },
        500: errorSchema
    }
}