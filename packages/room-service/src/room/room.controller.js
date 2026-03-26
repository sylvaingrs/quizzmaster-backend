import {create, endGame, getRoom, nextQuestion, startGame} from "./room.service.js";


/** @typedef {import('./types/room.dto').CreateRoomDto} CreateRoomDto */

export async function roomRoutes(app) {
    app.post('/', {
        schema: {
            tags: ['Room'],
            summary: 'Créer une room',
            body: {
                type: 'object',
                required: ['quizId'],
                properties: {
                    quizId: {type: 'number'}
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        quizId: {type: 'number'},
                        status: {type: 'string'}
                    }
                }
            }
        }
    }, async (req, reply) => {
        const room = await create(req.body.quizId)
        return reply.status(201).send(room)
    })

    app.get('/:id', {
        schema: {
            tags: ['Room'],
            summary: 'Récupérer une room',
            params: {
                type: 'object',
                properties: {
                    id: {type: 'string'}
                }
            }
        }
    }, async (req, reply) => {
        const room = await getRoom(req.params.id)
        if (!room) {
            return reply.status(404).send({error: 'Room not found'})
        }
        return reply.send(room)
    })

    app.post('/:id/start', {
        schema: {
            tags: ['Room'],
            summary: 'Démarrer la partie',
            params: {
                type: 'object',
                properties: {
                    id: {type: 'string'}
                }
            }
        }
    }, async (req, reply) => {
        try {
            const result = await startGame(req.params.id)
            return reply.send(result)
        } catch (error) {
            return reply.status(error.status).send({error: error.message})
        }
    })

    app.post('/:id/next', {
        schema: {
            tags: ['Room'],
            summary: 'Question suivante',
            params: {
                type: 'object',
                properties: {
                    id: {type: 'string'}
                }
            }
        }
    }, async (req, reply) => {
        try {
            const result = await nextQuestion(req.params.id)
            return reply.send(result)
        } catch (error) {
            return reply.status(error.status).send({error: error.message})
        }
    })

    app.post('/:id/end', {
        schema: {
            tags: ['Room'],
            summary: 'Terminer la partie',
            params: {
                type: 'object',
                properties: {
                    id: {type: 'string'}
                }
            }
        }
    }, async (req, reply) => {
        const result = await endGame(req.params.id)
        return reply.send(result)
    })
}