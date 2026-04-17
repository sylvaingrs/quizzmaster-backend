import { getLastCheckpoint } from '../service/score.service.js';
import { handleError, errorSchema } from '#errors';
import { roomScoreSchema } from './schema/roomCheckpoint.schema.js';

export async function scoreRoutes(app) {
    app.get('/:roomid/last', { schema: roomScoreSchema }, async (req, reply) => {
        try {
            const checkpoint = await getLastCheckpoint(req.params.roomid);
            return reply.code(200).send(checkpoint);
        } catch (error) {
            app.log.error(error);
            return handleError(error, reply);
        }
    })
}
