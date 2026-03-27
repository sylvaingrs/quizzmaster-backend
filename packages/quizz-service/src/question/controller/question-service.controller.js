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
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
            quizzId:   request.params.quizzId,
        }, 'Fetching all questions');
        try {
            const questions = await service.findAllQuestions(request.params.quizzId);
            request.log.info({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   request.params.quizzId,
                count:     questions.length,
            }, 'Questions fetched successfully');
            return reply.code(200).send(questions);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   request.params.quizzId,
                err:       e,
            }, 'Failed to fetch questions');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.get('/quizz/:quizzId/questions/:id', { schema: getQuestionSchema }, async (request, reply) => {
        request.log.info({
            requestId:  request.id,
            traceId:    request.headers['x-trace-id'] ?? request.id,
            quizzId:    request.params.quizzId,
            questionId: request.params.id,
        }, 'Fetching question');
        try {
            const question = await service.findQuestion(request.params.quizzId, request.params.id);
            request.log.info({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: question.id,
            }, 'Question fetched successfully');
            return reply.code(200).send(question);
        } catch (e) {
            request.log.error({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: request.params.id,
                err:        e,
            }, 'Failed to fetch question');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.post('/quizz/:quizzId/questions', { schema: createQuestionSchema }, async (request, reply) => {
        request.log.info({
            requestId: request.id,
            traceId:   request.headers['x-trace-id'] ?? request.id,
            quizzId:   request.params.quizzId,
        }, 'Creating question');
        try {
            const question = await service.createQuestion(request.params.quizzId, request.body);
            request.log.info({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: question.id,
            }, 'Question created successfully');
            return reply.code(201).send(question);
        } catch (e) {
            request.log.error({
                requestId: request.id,
                traceId:   request.headers['x-trace-id'] ?? request.id,
                quizzId:   request.params.quizzId,
                err:       e,
            }, 'Failed to create question');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.patch('/quizz/:quizzId/questions/:id', { schema: updateQuestionSchema }, async (request, reply) => {
        request.log.info({
            requestId:  request.id,
            traceId:    request.headers['x-trace-id'] ?? request.id,
            quizzId:    request.params.quizzId,
            questionId: request.params.id,
        }, 'Updating question');
        try {
            const question = await service.updateQuestion(request.params.quizzId, request.params.id, request.body);
            request.log.info({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: question.id,
            }, 'Question updated successfully');
            return reply.code(200).send(question);
        } catch (e) {
            request.log.error({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: request.params.id,
                err:        e,
            }, 'Failed to update question');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });

    fastify.delete('/quizz/:quizzId/questions/:id', { schema: deleteQuestionSchema }, async (request, reply) => {
        request.log.info({
            requestId:  request.id,
            traceId:    request.headers['x-trace-id'] ?? request.id,
            quizzId:    request.params.quizzId,
            questionId: request.params.id,
        }, 'Deleting question');
        try {
            await service.deleteQuestion(request.params.quizzId, request.params.id);
            request.log.info({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: request.params.id,
            }, 'Question deleted successfully');
            return reply.code(204).send();
        } catch (e) {
            request.log.error({
                requestId:  request.id,
                traceId:    request.headers['x-trace-id'] ?? request.id,
                quizzId:    request.params.quizzId,
                questionId: request.params.id,
                err:        e,
            }, 'Failed to delete question');
            return reply.code(e.statusCode ?? 500).send({ message: e.message });
        }
    });
}