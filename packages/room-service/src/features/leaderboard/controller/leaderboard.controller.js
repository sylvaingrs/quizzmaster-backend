import {getLeaderboardSchema} from "./schema/leaderboard.schema.js";
import {fetchLeaderboard} from "../service/leaderboard.service.js";
import {handleError} from "#errors";

export async function leaderboardRoutes(app) {
    app.get('/:id', {schema: getLeaderboardSchema}, async (req, reply) => {
        try {
            const result = await fetchLeaderboard(req.params.id)
            return reply.send(result)
        } catch (error) {
            return handleError(error, reply)
        }
    })
}