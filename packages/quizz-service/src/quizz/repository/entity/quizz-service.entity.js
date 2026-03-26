export class QuizzEntity {
    /** @param {{ id: number, title: string }} data */
    constructor({ id, title }) {
        this.title = title;
        this.id = id;
    }
}