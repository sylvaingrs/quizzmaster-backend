import {QuizzRepository} from "../repository/quizz-service.repository.js";

export class QuizzService {

    constructor () {
        this.repository = new QuizzRepository();
    }

    /**
     * @param {{ title: string }} dto
     * @returns { Promise<QuizzEntity> }
     */
    async createQuizz (dto) {
        return await this.repository.create(dto);
    }


    /**
     * @param { number } id
     * @returns { Promise<QuizzEntity> }
     */
    async findQuizz(id) {
        const quizz = await this.repository.findById(id)
        if (!quizz) throw { statusCode: 404, message: 'Quizz not Found' };
        return quizz;
    }

    /**
     * @return { Promise<QuizzEntity[]> }
     */
    async findAllQuizz() {
        return this.repository.findAll();
    }

    /**
     * @param { number } id
     * @returns { Promise<QuizzEntity> }
     */
    async deleteQuizz(id) {
        const quizz = await this.repository.delete(id);
        if (!quizz) throw { statusCode: 404, message: 'Quizz not Found' };
        return quizz;
    }
}