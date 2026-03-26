// question-service.repository.js
import { prisma }         from '@quizzmaster-backend/prisma';
import { QuestionEntity } from './entity/question-service.entity.js';
import { createLogger } from '@quizzmaster-backend/logger';

const logger = createLogger('question-repository');

export class QuestionRepository {
    /**
     * @param {number} quizzId
     * @return {Promise<QuestionEntity[]>}
     */
    async findAll(quizzId) {
        logger.debug({ quizzId }, 'DB: finding all questions for quizz');
        const questions = await prisma.question.findMany({ where: { quizId: quizzId } });
        logger.debug({ quizzId, count: questions.length }, 'DB: questions found');
        return questions.map((q) => new QuestionEntity(q));
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @return {Promise<QuestionEntity | null>}
     */
    async findById(quizzId, id) {
        logger.debug({ quizzId, questionId: id }, 'DB: finding question by id');
        const question = await prisma.question.findFirst({ where: { id, quizId: quizzId } });
        return question ? new QuestionEntity(question) : null;
    }

    /**
     * @param {number} quizzId
     * @param {{ title: string, options: string[], correctAnswer: string[], timeLimit?: number }} data
     * @return {Promise<QuestionEntity>}
     */
    async create(quizzId, data) {
        logger.debug({ quizzId, data }, 'DB: creating question');
        const question = await prisma.question.create({
            data: { ...data, quizId: quizzId },
        });
        logger.debug({ quizzId, questionId: question.id }, 'DB: question created');
        return new QuestionEntity(question);
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @param {Partial<{title: string, options: string[], correctAnswer: string[], timeLimit: number}>} data
     * @return {Promise<QuestionEntity | null>}
     */
    async update(quizzId, id, data) {
        logger.debug({ quizzId, questionId: id, data }, 'DB: updating question');
        try {
            const question = await prisma.question.update({
                where: { id, quizId: quizzId },
                data,
            });
            logger.debug({ quizzId, questionId: id }, 'DB: question updated');
            return new QuestionEntity(question);
        } catch (e) {
            if (e.code === 'P2025') return null;
            throw e;
        }
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @return {Promise<QuestionEntity | null>}
     */
    async delete(quizzId, id) {
        logger.debug({ quizzId, questionId: id }, 'DB: deleting question');
        try {
            const question = await prisma.question.delete({ where: { id, quizId: quizzId } });
            logger.debug({ quizzId, questionId: id }, 'DB: question deleted');
            return new QuestionEntity(question);
        } catch (e) {
            if (e.code === 'P2025') return null;
            throw e;
        }
    }
}