import {RoomError} from "@quizzmaster-backend/tools/errors"
import {createRoom, getRoom, joinRoom} from "../service/user.service.js"
import {createRoomSchema, getRoomSchema, joinRoomSchema} from "./schema/user.schema.js"

/**
 * @param {Error} error
 * @param {import('fastify').FastifyReply} reply
 */
function handleError(error, reply) {
    if (error instanceof RoomError) {
        return reply.status(error.status).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Internal Server Error' })
}

export async function userRoutes(app) {
    app.get('/health', async () => {
        return { status: 'OK', alive: true }
    })

    app.post('/rooms', { schema: createRoomSchema }, async (req, reply) => {
        try {
            const room = await createRoom(req.body.quizId, req.body.pseudo)
            return reply.status(201).send(room)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.get('/rooms/:roomId', { schema: getRoomSchema }, async (req, reply) => {
        try {
            const room = await getRoom(req.params.roomId)
            return reply.send(room)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.post('/rooms/:roomId/join', { schema: joinRoomSchema }, async (req, reply) => {
        try {
            const result = await joinRoom(req.params.roomId, req.body.pseudo)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })
}