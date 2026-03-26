// quizz-service.repository.js
import { QuizzEntity } from "./entity/quizz-service.entity.js";
import { prisma }      from '../../../../prisma/src/prisma.js';
import { createLogger }      from '@quizzmaster-backend/logger';

const logger = createLogger('quizz-repository');

export class QuizzRepository {
    /**
     * @param {{ title: string }} data
     * @return {Promise<QuizzEntity>}
     */
    async create(data) {
        logger.debug({ data }, 'DB: creating quizz');
        const quizz = await prisma.quiz.create({ data });
        logger.debug({ quizzId: quizz.id }, 'DB: quizz created');
        return new QuizzEntity(quizz);
    }

    /**
     * @param {number} id
     * @return {Promise<QuizzEntity | null>}
     */
    async findById(id) {
        logger.debug({ quizzId: id }, 'DB: finding quizz by id');
        const quizz = await prisma.quiz.findUnique({ where: { id } });
        return quizz ? new QuizzEntity(quizz) : null;
    }

    /**
     * @return {Promise<QuizzEntity[]>}
     */
    async findAll() {
        logger.debug('DB: finding all quizzs');
        const quizzs = await prisma.quiz.findMany();
        logger.debug({ count: quizzs.length }, 'DB: quizzs found');
        return quizzs.map((quizz) => new QuizzEntity(quizz));
    }

    /**
     * @param {number} id
     * @return {Promise<QuizzEntity | null>}
     */
    async delete(id) {
        logger.debug({ quizzId: id }, 'DB: deleting quizz');
        try {
            const quizz = await prisma.quiz.delete({ where: { id } });
            logger.debug({ quizzId: id }, 'DB: quizz deleted');
            return new QuizzEntity(quizz);
        } catch (e) {
            if (e.code === 'P2025') return null;
            throw e;
        }
    }
}