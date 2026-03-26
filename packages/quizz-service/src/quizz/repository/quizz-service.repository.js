import {QuizzEntity} from "./entity/quizz-service.entity.js";
import { prisma } from '../../../../prisma/src/prisma.js'

export class QuizzRepository {
    /**
     * @param {{ title: string }} data
     * @return { Promise<QuizzEntity> }
     */
    async create(data) {
        const quizz = await prisma.quiz.create({ data });
        return quizz ? new QuizzEntity(quizz) : null;
    }

    /**
     * @param { number } id
     * @return { Promise<QuizzEntity | null> }
     */
    async findById(id) {
        const quizz = await prisma.quiz.findUnique( { where: { id: id } });
        return quizz ? new QuizzEntity(quizz) : null;
    }

    /**
     * @return { Promise<QuizzEntity[]> }
     */
    async findAll() {
        const quizzs = await prisma.quiz.findMany();
        return quizzs.map((quizz) => new QuizzEntity(quizz));
    }

    /**
     * @param { number } id
     * @return { Promise<QuizzEntity | null> }
     */
    async delete(id) {
        try {
            const quizz = await prisma.quiz.delete({ where: { id } });
            return new QuizzEntity(quizz);
        } catch (e) {
            // not found
            if (e.code === 'P2025') return null;
            throw e;
        }
    }
}