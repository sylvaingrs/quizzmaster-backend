import {QuizzService} from "../service/quizz-service.service.js";
import {
    createQuizzSchema,
    deleteQuizzSchema,
    getAllQuizzSchema,
    getQuizzSchema
} from "./contract/quizz-service.contract.js";

const service = new QuizzService();

/**
 * @param { import('fastify').FastifyInstance } fastify
 */
export async function quizzController(fastify) {
    fastify.post('/quizz', { schema: createQuizzSchema }, async (request, reply) => {
        try {
            const quizz = await service.createQuizz(request.body);
            return reply.code(201).send(quizz);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.get('/quizz', { schema: getAllQuizzSchema }, async (request, reply) => {
        try {
            const quizzs = await service.findAllQuizz();
            return reply.code(200).send(quizzs);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    })

    fastify.get('/quizz/:id', { schema: getQuizzSchema }, async (request, reply) => {
        try {
            request.log.info({
                requestId: request.id,
                traceId: request.headers['x-trace-id'] ?? request.id,
                quizzId: request.params.id,
            }, 'Fetching quizz');
            const quizz = await service.findQuizz(request.params.id);
            return reply.code(200).send(quizz);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId: request.headers['x-trace-id'] ?? request.id,
                quizzId: request.params.id,
                err: e.message,
            }, 'Failed to fecth quizz');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    })

    fastify.delete('/quizz/:id', { schema: deleteQuizzSchema }, async (request, reply) => {
        try {
            const quizz = await service.deleteQuizz(request.params.id);
            return reply.code(200).send(quizz);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    })
}