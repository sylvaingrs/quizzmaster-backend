import { QuestionRepository } from '../repository/question-service.repository.js';
import { QuizzRepository }    from '../../quizz/repository/quizz-service.repository.js';

export class QuestionService {
    constructor() {
        this.repository      = new QuestionRepository();
        this.quizzRepository = new QuizzRepository();
    }

    /** @param {number} quizzId */
    async #assertQuizzExists(quizzId) {
        const quizz = await this.quizzRepository.findById(quizzId);
        if (!quizz) throw { statusCode: 404, message: 'Quizz not found' };
    }

    /**
     * @param {number} quizzId
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity[]>}
     */
    async findAllQuestions(quizzId) {
        await this.#assertQuizzExists(quizzId);
        return this.repository.findAll(quizzId);
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async findQuestion(quizzId, id) {
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.findById(quizzId, id);
        if (!question) throw { statusCode: 404, message: 'Question not found' };
        return question;
    }

    /**
     * @param {number} quizzId
     * @param {{ title: string, options: string[], correctAnswer: string[], timeLimit?: number }} dto
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async createQuestion(quizzId, dto) {
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
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.update(quizzId, id, dto);
        if (!question) throw { statusCode: 404, message: 'Question not found' };
        return question;
    }

    /**
     * @param {number} quizzId
     * @param {number} id
     * @returns {Promise<import('../entity/question-service.entity.js').QuestionEntity>}
     */
    async deleteQuestion(quizzId, id) {
        await this.#assertQuizzExists(quizzId);
        const question = await this.repository.delete(quizzId, id);
        if (!question) throw { statusCode: 404, message: 'Question not found' };
        return question;
    }
}