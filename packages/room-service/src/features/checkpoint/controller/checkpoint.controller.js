import {recoverRoom} from "../service/checkpoint.service.js";
import {recoverSchema} from "./schema/checkpoint.schema.js";
import {handleError} from "#errors";

export async function checkpointRoutes(app) {
    app.post('/:id/recover', { schema: recoverSchema }, async (req, reply) => {
        try {
            const result = await recoverRoom(req.params.id)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })
}