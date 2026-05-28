import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

vi.mock('@quizzmaster-backend/room-service/src/features/checkpoint/service/checkpoint.service.js', () => ({
    recoverRoom: vi.fn(),
    autoRecoverPlayingRooms: vi.fn(),
}))

vi.mock('@quizzmaster-backend/room-service/src/features/checkpoint/repository/checkpoint.repository.js', () => ({
    findPlayingRooms: vi.fn(),
}))

vi.mock('@quizzmaster-backend/room-service/src/features/room/service/room.service.js', () => ({
    getRoom: vi.fn(),
}))

vi.mock('@quizzmaster-backend/room-service/src/features/room/repository/room.repository.js', () => ({
    updateStatus: vi.fn(),
}))

vi.mock('@quizzmaster-backend/valkey-service/client.js', () => ({
    valkey: {
        hset: vi.fn(),
        set: vi.fn(),
        hget: vi.fn(),
        del: vi.fn(),
        zadd: vi.fn(),
    },
}))

vi.mock('@quizzmaster-backend/valkey-service/publisher.js', () => ({
    publish: vi.fn(),
}))

import { checkpointRoutes } from '@quizzmaster-backend/room-service/src/features/checkpoint/controller/checkpoint.controller.js'
import { recoverRoom } from '@quizzmaster-backend/room-service/src/features/checkpoint/service/checkpoint.service.js'
import { findPlayingRooms } from '@quizzmaster-backend/room-service/src/features/checkpoint/repository/checkpoint.repository.js'
import { getRoom } from '@quizzmaster-backend/room-service/src/features/room/service/room.service.js'
import { updateStatus } from '@quizzmaster-backend/room-service/src/features/room/repository/room.repository.js'
import { valkey } from '@quizzmaster-backend/valkey-service/client.js'
import { publish } from '@quizzmaster-backend/valkey-service/publisher.js'

const { recoverRoom: recoverRoomSvc, autoRecoverPlayingRooms } = await vi.importActual(
    './service/checkpoint.service.js'
)

const mockRoom = {
    id: 'R1',
    quizId: 7,
    status: 'PLAYING',
    players: [
        { id: 'u1', name: 'Alice', role: 'PLAYER' },
        { id: 'u2', name: 'Bob', role: 'PLAYER' },
    ],
}

const mockCheckpoint = {
    quizId: 7,
    questionId: 2,
    scores: [
        { userId: 'u1', score: 30 },
        { userId: 'u2', score: 10 },
    ],
}

const mockQuestions = [
    { id: 1, title: 'Q1', timeLimit: 20 },
    { id: 2, title: 'Q2', timeLimit: 15 },
    { id: 3, title: 'Q3', timeLimit: 25 },
]

async function buildApp() {
    const app = Fastify()
    await app.register(checkpointRoutes)
    return app
}

// --- Controller ---

describe('POST /:id/recover (controller)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne les données de recover avec status 200', async () => {
        const mockResult = { roomId: 'R1', questionId: 2, scores: mockCheckpoint.scores }
        recoverRoom.mockResolvedValue(mockResult)
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/R1/recover' })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual(mockResult)
        expect(recoverRoom).toHaveBeenCalledWith('R1')
    })

    it('retourne 404 si checkpoint absent', async () => {
        const { NotFoundError } = await import('#errors')
        recoverRoom.mockRejectedValue(new NotFoundError('Checkpoint introuvable pour la room R1'))
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/R1/recover' })

        expect(res.statusCode).toBe(404)
        expect(res.json().message).toContain('Checkpoint')
    })

    it('retourne 500 si le service score est KO', async () => {
        const { RoomError } = await import('#errors')
        recoverRoom.mockRejectedValue(new RoomError('Erreur lors de la communication avec le service de score', 500))
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/R1/recover' })

        expect(res.statusCode).toBe(500)
    })
})

// --- Service ---

describe('recoverRoom() (service)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getRoom.mockResolvedValue(mockRoom)
        updateStatus.mockResolvedValue({})
        valkey.hset.mockResolvedValue(1)
        valkey.set.mockResolvedValue('OK')
        valkey.del.mockResolvedValue(1)
        valkey.zadd.mockResolvedValue(1)
    })

    function mockFetch(checkpoint = mockCheckpoint, questions = mockQuestions) {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(checkpoint) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(questions) })
    }

    it('reconstruit la room depuis le checkpoint et retourne les données', async () => {
        mockFetch()

        const result = await recoverRoomSvc('R1')

        expect(result.roomId).toBe('R1')
        expect(result.questionId).toBe(2)
        expect(result.scores).toEqual(mockCheckpoint.scores)
    })

    it('met à jour le status en PLAYING', async () => {
        mockFetch()

        await recoverRoomSvc('R1')

        expect(updateStatus).toHaveBeenCalledWith('R1', 'PLAYING')
    })

    it('restaure les joueurs dans valkey', async () => {
        mockFetch()

        await recoverRoomSvc('R1')

        expect(valkey.hset).toHaveBeenCalledWith(
            'room:R1:players',
            expect.objectContaining({ u1: expect.any(String) })
        )
    })

    it('restaure les scores dans le leaderboard valkey', async () => {
        mockFetch()

        await recoverRoomSvc('R1')

        expect(valkey.zadd).toHaveBeenCalledWith('leaderboard:R1', 30, 'u1')
        expect(valkey.zadd).toHaveBeenCalledWith('leaderboard:R1', 10, 'u2')
    })

    it('publie game.started et scores.updated', async () => {
        mockFetch()

        await recoverRoomSvc('R1')

        expect(publish).toHaveBeenCalledWith('game.started', expect.objectContaining({ roomId: 'R1' }))
        expect(publish).toHaveBeenCalledWith('scores.updated', expect.objectContaining({ roomId: 'R1' }))
    })

    it('se positionne sur la première question si questionId absent du quiz', async () => {
        mockFetch({ ...mockCheckpoint, questionId: 999 })

        const result = await recoverRoomSvc('R1')

        expect(result.questionId).toBe(mockQuestions[0].id)
    })

    it('lève NotFoundError si le service score répond 404', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 })

        await expect(recoverRoomSvc('R1')).rejects.toThrow('Checkpoint introuvable')
    })

    it('lève RoomError si le service score répond une autre erreur', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 })

        await expect(recoverRoomSvc('R1')).rejects.toThrow('service de score')
    })

    it('lève RoomError si le service quiz est KO', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCheckpoint) })
            .mockResolvedValueOnce({ ok: false, status: 500 })

        await expect(recoverRoomSvc('R1')).rejects.toThrow('Impossible de charger les questions')
    })
})

describe('autoRecoverPlayingRooms() (service)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getRoom.mockResolvedValue(mockRoom)
        updateStatus.mockResolvedValue({})
        valkey.hset.mockResolvedValue(1)
        valkey.set.mockResolvedValue('OK')
        valkey.del.mockResolvedValue(1)
        valkey.zadd.mockResolvedValue(1)
    })

    it('ne fait rien si toutes les rooms ont déjà une question en cache', async () => {
        findPlayingRooms.mockResolvedValue([{ id: 'R1' }])
        valkey.hget.mockResolvedValue(JSON.stringify({ id: 1, title: 'Q1' }))

        global.fetch = vi.fn()

        await autoRecoverPlayingRooms()

        // recoverRoom ne doit pas être appelé (pas de fetch)
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('appelle recoverRoom pour les rooms sans question en cache', async () => {
        findPlayingRooms.mockResolvedValue([{ id: 'R1' }, { id: 'R2' }])
        valkey.hget.mockResolvedValue(null) // aucune question en cache

        global.fetch = vi.fn()
            .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockCheckpoint) })
            .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockQuestions) })

        // On ne teste pas le contenu de recoverRoom ici, juste qu'il est appelé
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCheckpoint) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockQuestions) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCheckpoint) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockQuestions) })

        await autoRecoverPlayingRooms()

        expect(global.fetch).toHaveBeenCalled()
    })

    it('ne plante pas si aucune room en PLAYING', async () => {
        findPlayingRooms.mockResolvedValue([])

        await expect(autoRecoverPlayingRooms()).resolves.toBeUndefined()
    })
})