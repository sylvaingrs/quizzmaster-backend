export class QuestionEntity {
    /** @param {{ id: number, quizId: number, title: string, options: string[], correctAnswer: string[], timeLimit: number }} data */
    constructor({id, quizId, title, options, correctAnswer, timeLimit}) {
        this.id            = id;
        this.quizId        = quizId;
        this.title         = title;
        this.options       = options;
        this.correctAnswer = correctAnswer;
        this.timeLimit     = timeLimit;
    }
}