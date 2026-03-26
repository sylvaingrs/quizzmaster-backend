import {prisma} from "../../../../prisma/src/prisma.js";
import {QuestionEntity} from "./entity/question-service.entity.js";

export class QuestionRepository {
    /** @param {number} quizzId */
    async findAll(quizzId) {
        const questions = await prisma.question.findMany({ where: { quizId: quizzId } });
        return questions.map((q) => new QuestionEntity(q));
    }

    /** @param {number} quizzId
     *  @param {number} id */
    async findById(quizzId, id) {
        const question = await prisma.question.findFirst({ where: { id: id, quizId: quizzId } });
        return question ? new QuestionEntity(question) : null;
    }

    /** @param {number} quizzId
     *  @param {{ title: string, options: string[], correctAnswer: string[], timeLimit?: number }} data */
    async create(quizzId, data) {
        const question = await prisma.question.create({
            data: { ...data, quizId: quizzId },
        });
        return new QuestionEntity(question);
    }

    /** @param {number} quizzId
     *  @param {number} id
     *  @param {Partial<{title: string, options: string[], correctAnswer: string[], timeLimit: number}>} data */
    async update(quizzId, id, data) {
        try {
            const question = await prisma.question.update({
                where:  { id: id, quizId: quizzId },
                data,
            });
            return new QuestionEntity(question);
        } catch (e) {
            if (e.code === 'P2025') return null;
            throw e;
        }
    }

    /** @param {number} quizzId
     *  @param {number} id */
    async delete(quizzId, id) {
        try {
            const question = await prisma.question.delete({ where: { id: id, quizId: quizzId } });
            return new QuestionEntity(question);
        } catch (e) {
            if (e.code === 'P2025') return null;
            throw e;
        }
    }
}