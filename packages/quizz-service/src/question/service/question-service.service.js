// question-service.service.js
import { QuestionRepository } from '../repository/question-service.repository.js';
import { QuizzRepository }    from '../../quizz/repository/quizz-service.repository.js';
import { createLogger }             from '@quizzmaster-backend/logger';

const logger = createLogger('question-service');

export class QuestionService {
    constructor() {
        this.repository      = new QuestionRepository();
        this.quizzRepository = new QuizzRepository();
    }

    /** @param {number} quizzId */
    async #assertQuizzExists(quizzId) {
        const quizz = await this.quizzRepository.findById(quizzId);
        if (!quizz) {
            logger.warn({ quizzId }, 'Service: quizz not found');
            throw { statusCode: 404, message: 'Quizz not found' };
        }
    }

    /**
     * @param {number} quizzId
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity[]>}
     */
    async findAllQuestions(quizzId) {
        logger.debug({ quizzId }, 'Service: finding all questions');
        await this.#assertQuizzExists(quizzId);
        return this.repository.findAll(quizzId);
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async findQuestion(quizzId, id) {
        logger.debug({ quizzId, questionId: id }, 'Service: finding question');
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.findById(quizzId, id);
        if (!question) {
            logger.warn({ quizzId, questionId: id }, 'Service: question not found');
            throw { statusCode: 404, message: 'Question not found' };
        }
        return question;
    }

    /**
     * @param {number} quizzId
     * @param {{ title: string, options: string[], correctAnswer: string[], timeLimit?: number }} dto
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async createQuestion(quizzId, dto) {
        logger.debug({ quizzId, dto }, 'Service: creating question');
        await this.#assertQuizzExists(quizzId);
        return this.repository.create(quizzId, dto);
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @param {{ title?: string, options?: string[], correctAnswer?: string[], timeLimit?: number }} dto
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async updateQuestion(quizzId, id, dto) {
        logger.debug({ quizzId, questionId: id, dto }, 'Service: updating question');
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.update(quizzId, id, dto);
        if (!question) {
            logger.warn({ quizzId, questionId: id }, 'Service: question not found for update');
            throw { statusCode: 404, message: 'Question not found' };
        }
        return question;
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async deleteQuestion(quizzId, id) {
        logger.debug({ quizzId, questionId: id }, 'Service: deleting question');
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.delete(quizzId, id);
        if (!question) {
            logger.warn({ quizzId, questionId: id }, 'Service: question not found for deletion');
            throw { statusCode: 404, message: 'Question not found' };
        }
        return question;
    }
}