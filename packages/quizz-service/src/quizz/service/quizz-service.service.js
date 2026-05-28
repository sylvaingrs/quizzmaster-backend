// quizz-service.service.js
import { QuizzRepository } from "../repository/quizz-service.repository.js";
import { createLogger }      from '@quizzmaster-backend/logger';

const logger = createLogger('quizz-service');

export class QuizzService {
    constructor() {
        this.repository = new QuizzRepository();
    }

    /**
     * @param {{ title: string }} dto
     * @returns {Promise<QuizzEntity>}
     */
    async createQuizz(dto) {
        logger.debug({ dto }, 'Service: creating quizz');
        return this.repository.create(dto);
    }

    /**
     * @param {number} id
     * @returns {Promise<QuizzEntity>}
     */
    async findQuizz(id) {
        logger.debug({ quizzId: id }, 'Service: finding quizz');
        const quizz = await this.repository.findById(id);
        if (!quizz) {
            logger.warn({ quizzId: id }, 'Service: quizz not found');
            throw { statusCode: 404, message: 'Quizz not Found' };
        }
        return quizz;
    }

    /**
     * @returns {Promise<QuizzEntity[]>}
     */
    async findAllQuizz() {
        logger.debug('Service: finding all quizzs');
        return this.repository.findAll();
    }

    /**
     * @param {number} id
     * @returns {Promise<QuizzEntity>}
     */
    async deleteQuizz(id) {
        logger.debug({ quizzId: id }, 'Service: deleting quizz');
        const quizz = await this.repository.delete(id);
        if (!quizz) {
            logger.warn({ quizzId: id }, 'Service: quizz not found for deletion');
            throw { statusCode: 404, message: 'Quizz not Found' };
        }
        return quizz;
    }
}