import {answer, buzz} from "../service/buzzer.service.js";
import {answerSchema, buzzSchema} from "./schema/room.schema.js";
import {handleError} from "#errors";


export async function buzzerRoutes(app) {
    app.post('/:id/buzz', { schema: buzzSchema }, async (req, reply) => {
        try {
            const result = await buzz(req.params.id, req.body.userId)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })

    app.post('/:id/answer', { schema: answerSchema }, async (req, reply) => {
        try {
            const result = await answer(req.params.id, req.body)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })
}