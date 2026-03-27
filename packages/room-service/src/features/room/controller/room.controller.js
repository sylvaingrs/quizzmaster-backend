import {create, endGame, getRoom, nextQuestion, startGame} from "../service/room.service.js";
import {
    createRoomSchema,
    endRoomSchema,
    getRoomSchema,
    nextQuestionSchema,
    startRoomSchema
} from "./schema/room.schema.js";
import {handleError} from "#errors";

/** @typedef {import('./dto/room.dto.d.ts').CreateRoomDto} CreateRoomDto */

export async function roomRoutes(app) {
    app.post('/', {schema: createRoomSchema}, async (req, reply) => {
        try {
            const room = await create(req.body.quizId)
            return reply.status(201).send(room)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.get('/:id', {schema: getRoomSchema}, async (req, reply) => {
        try {
            const room = await getRoom(req.params.id)
            return reply.send(room)
        } catch (error) {
            req.log.error({
                requestId: req.id,
                traceId: req.headers['x-trace-id'] ?? req.id,
                roomId: req.params.id,
                err: error.message,
            }, 'Failed to fecth room');
            return handleError(error, reply)
        }
    })

    app.post('/:id/start', {schema: startRoomSchema}, async (req, reply) => {
        try {
            const result = await startGame(req.params.id)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.post('/:id/next', {schema: nextQuestionSchema}, async (req, reply) => {
        try {
            const result = await nextQuestion(req.params.id)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.post('/:id/end', {schema: endRoomSchema}, async (req, reply) => {
        try {
            const result = await endGame(req.params.id)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })
}