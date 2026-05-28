import { describe, it, expect, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { quizzController } from './quizz-service.controller.js'

describe('QuizzController', () => {
    let app

    beforeEach(async () => {
        app = Fastify({
            ajv: {
                customOptions: {
                    coerceTypes: true
                }
            }
        })

        const mockService = {
            createQuizz: async () => ({ id: 1, title: 'Test' }),
            findQuizz: async () => ({ id: 1, title: 'Test' }),
            findAllQuizz: async () => [{ id: 1, title: 'Test' }],
            deleteQuizz: async () => ({ id: 1, title: 'Test' }),
        }

        app.decorate('quizzService', mockService)

        await app.register(quizzController)
        await app.ready()
    })

    it('POST /quizz', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/quizz',
            payload: { title: 'Test' },
        })

        expect(res.statusCode).toBe(201)
    })

    it('GET /quizz', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/quizz',
        })

        expect(res.statusCode).toBe(200)
        expect(JSON.parse(res.payload)).toHaveLength(1)
    })

    it('GET /quizz/:id', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/quizz/1',
        })

        expect(res.statusCode).toBe(200)
    })

    it('DELETE /quizz/:id', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: '/quizz/1',
        })

        expect(res.statusCode).toBe(200)
    })
})