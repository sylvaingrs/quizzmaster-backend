import { describe, it, expect, beforeAll } from 'vitest'
import Fastify from 'fastify'
import { questionController } from './question-service.controller.js'

describe('QuestionController', () => {
    let app

    beforeAll(async () => {
        app = Fastify()

        const mockService = {
            findAllQuestions: async () => [{ id: 1 }],
            findQuestion: async () => ({ id: 1 }),
            createQuestion: async () => ({ id: 2 }),
            updateQuestion: async () => ({ id: 3 }),
            deleteQuestion: async () => ({ id: 4 }),
        }

        app.decorate('questionService', mockService)

        await app.register(questionController)
        await app.ready()
        console.log(app.printRoutes())
    })

    it('GET /quizz/:id/questions', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/quizz/1/questions',
        })

        expect(res.statusCode).toBe(200)
    })

    it('POST /quizz/:id/questions', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/quizz/1/questions',
            payload: {
                title: 'Q',
                options: ['a', 'b'],
                correctAnswer: ['a'],
            },
        })

        expect(res.statusCode).toBe(201)
    })
})