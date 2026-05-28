import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

vi.mock('./service/buzzer.service.js', () => ({
    buzz: vi.fn(),
    answer: vi.fn(),
}))

import { buzzerRoutes } from './controller/buzzer.controller.js'
import { buzz, answer } from './service/buzzer.service.js'

async function buildApp() {
    const app = Fastify()
    await app.register(buzzerRoutes)
    return app
}

describe('POST /:id/buzz', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne success true si le buzz est accepté', async () => {
        buzz.mockResolvedValue({ success: true, userId: 'user1' })
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/buzz',
            payload: { userId: 'user1' },
        })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual({ success: true, userId: 'user1' })
        expect(buzz).toHaveBeenCalledWith('room42', 'user1')
    })

    it('retourne success false si le buzz est refusé', async () => {
        buzz.mockResolvedValue({ success: false, userId: 'user2' })
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/buzz',
            payload: { userId: 'user2' },
        })

        expect(res.statusCode).toBe(200)
        expect(res.json().success).toBe(false)
    })

    it('retourne 500 si le service lève une erreur inattendue', async () => {
        buzz.mockRejectedValue(new Error('Valkey unavailable'))
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/buzz',
            payload: { userId: 'user1' },
        })

        expect(res.statusCode).toBe(500)
    })

    it('retourne 400 si userId manquant dans le body', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/buzz',
            payload: {},
        })

        expect(res.statusCode).toBe(400)
    })
})

describe('POST /:id/answer', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne correct true si la réponse est bonne', async () => {
        answer.mockResolvedValue({ correct: true, userId: 'user1' })
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { userId: 'user1', answer: ['optionA'] },
        })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual({ correct: true, userId: 'user1' })
        expect(answer).toHaveBeenCalledWith('room42', { userId: 'user1', answer: ['optionA'] })
    })

    it('retourne correct false si la réponse est mauvaise', async () => {
        answer.mockResolvedValue({ correct: false, userId: 'user1' })
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { userId: 'user1', answer: ['optionB'] },
        })

        expect(res.statusCode).toBe(200)
        expect(res.json().correct).toBe(false)
    })

    it('retourne 400 si userId manquant', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { answer: ['optionA'] },
        })

        expect(res.statusCode).toBe(400)
    })

    it('retourne 400 si answer manquant', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { userId: 'user1' },
        })

        expect(res.statusCode).toBe(400)
    })

    it('retourne 400 si user n\'a pas buzzé (BadRequestError)', async () => {
        const { BadRequestError } = await import('#errors')
        answer.mockRejectedValue(new BadRequestError('User did not buzz or is not the first to buzz'))
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { userId: 'user1', answer: ['optionA'] },
        })

        expect(res.statusCode).toBe(400)
        expect(res.json().message).toContain('buzz')
    })

    it('retourne 404 si aucune question en cours (NotFoundError)', async () => {
        const { NotFoundError } = await import('#errors')
        answer.mockRejectedValue(new NotFoundError('No current question found for this room'))
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/room42/answer',
            payload: { userId: 'user1', answer: ['optionA'] },
        })

        expect(res.statusCode).toBe(404)
    })
})