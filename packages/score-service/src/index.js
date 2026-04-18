import { app } from './config/fastify.js'
import { scoreRoutes } from './features/score/controller/score.controller.js'
import { subscribe } from '../../rabbitmq/subscriber.js'
import { QUEUES } from '../../rabbitmq/queues.js'
import { saveCheckpoint } from './features/score/service/score.service.js'

await app.register(scoreRoutes, { prefix: '/checkpoint' })

try {
    await subscribe(QUEUES.SCORE_PERSISTENCE, async (data) => {
        try {
            await saveCheckpoint(data);
            app.log.info({ roomId: data.roomId, questionId: data.questionId }, 'Checkpoint saved successfully');
        } catch (error) {
            app.log.error({ error, data }, 'Failed to save checkpoint from queue');
        }
    });
    app.log.info(`Subscribed to queue: ${QUEUES.SCORE_PERSISTENCE}`);
} catch (error) {
    app.log.error(error, 'Failed to subscribe to RabbitMQ');
}

await app.listen({ port: 3004, host: '0.0.0.0' })
