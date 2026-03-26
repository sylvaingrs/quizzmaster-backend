import { QuestionService } from '../service/question-service.service.js';
import {
    createQuestionSchema, getQuestionSchema,
    getAllQuestionsSchema, updateQuestionSchema,
    deleteQuestionSchema
} from './dto/question-service.dto.js';

const service = new QuestionService();

/** @param {import('fastify').FastifyInstance} fastify */
export async function questionController(fastify) {
    fastify.get('/quizz/:quizzId/questions', { schema: getAllQuestionsSchema }, async (request, reply) => {
        try {
            const questions = await service.findAllQuestions(request.params.quizzId);
            return reply.code(200).send(questions);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.get('/quizz/:quizzId/questions/:id', { schema: getQuestionSchema }, async (request, reply) => {
        try {
            const question = await service.findQuestion(request.params.quizzId, request.params.id);
            return reply.code(200).send(question);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.post('/quizz/:quizzId/questions', { schema: createQuestionSchema }, async (request, reply) => {
        try {
            const question = await service.createQuestion(request.params.quizzId, request.body);
            return reply.code(201).send(question);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.patch('/quizz/:quizzId/questions/:id', { schema: updateQuestionSchema }, async (request, reply) => {
        try {
            const question = await service.updateQuestion(request.params.quizzId, request.params.id, request.body);
            return reply.code(200).send(question);
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.delete('/quizz/:quizzId/questions/:id', { schema: deleteQuestionSchema }, async (request, reply) => {
        try {
            await service.deleteQuestion(request.params.quizzId, request.params.id);
            return reply.code(204).send();
        } catch (e) {
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });
}