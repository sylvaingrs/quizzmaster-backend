import {QuizzService} from "../service/quizz-service.service.js";
import {
    createQuizzSchema,
    deleteQuizzSchema,
    getAllQuizzSchema,
    getQuizzSchema
} from "./dto/quizz-service.dto.js";

const service = new QuizzService();

/**
 * @param { import('fastify').FastifyInstance } fastify
 */
export async function quizzController(fastify) {

    fastify.post('/quizz', { schema: createQuizzSchema }, async (request, reply) => {
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
        }, 'Creating quizz');
        try {
            const quizz = await service.createQuizz(request.body);
            request.log.info({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   quizz.id,
            }, 'Quizz created successfully');
            return reply.code(201).send(quizz);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                err:       e,
            }, 'Failed to create quizz');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.get('/quizz', { schema: getAllQuizzSchema }, async (request, reply) => {
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
        }, 'Fetching all quizz');
        try {
            const quizzs = await service.findAllQuizz();
            request.log.info({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                count:     quizzs.length,
            }, 'Quizz fetched successfully');
            return reply.code(200).send(quizzs);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                err:       e,
            }, 'Failed to fetch all quizz');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.get('/quizz/:id', { schema: getQuizzSchema }, async (request, reply) => {
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
            quizzId:   request.params.id,
        }, 'Fetching quizz');
        try {
            const quizz = await service.findQuizz(request.params.id);
            request.log.info({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   quizz.id,
            }, 'Quizz fetched successfully');
            return reply.code(200).send(quizz);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   request.params.id,
                err:       e,
            }, 'Failed to fetch quizz');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.delete('/quizz/:id', { schema: deleteQuizzSchema }, async (request, reply) => {
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
            quizzId:   request.params.id,
        }, 'Deleting quizz');
        try {
            const quizz = await service.deleteQuizz(request.params.id);
            request.log.info({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   quizz.id,
            }, 'Quizz deleted successfully');
            return reply.code(200).send(quizz);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   request.params.id,
                err:       e,
            }, 'Failed to delete quizz');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });
}