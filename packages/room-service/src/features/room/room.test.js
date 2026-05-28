import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

vi.mock('@quizzmaster-backend/room-service/src/features/room/service/room.service.js', () => ({
    create: vi.fn(),
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    startGame: vi.fn(),
    nextQuestion: vi.fn(),
    endGame: vi.fn(),
}))

vi.mock('@quizzmaster-backend/room-service/src/features/room/repository/room.repository.js', () => ({
    createRoom: vi.fn(),
    findRoomById: vi.fn(),
    joinRoomRepository: vi.fn(),
    updateStatus: vi.fn(),
}))

vi.mock('@quizzmaster-backend/valkey-service/client.js', () => ({
    valkey: {
        hset: vi.fn(),
        set: vi.fn(),
        get: vi.fn(),
        hget: vi.fn(),
        hgetall: vi.fn(),
        del: vi.fn(),
        zadd: vi.fn(),
    },
}))

vi.mock('@quizzmaster-backend/valkey-service/publisher.js', () => ({
    publish: vi.fn(),
}))

vi.mock('@quizzmaster-backend/room-service/src/features/leaderboard/service/leaderboard.service.js', () => ({
    fetchLeaderboard: vi.fn(),
}))

import { roomRoutes } from '@quizzmaster-backend/room-service/src/features/room/controller/room.controller.js'
import { create, getRoom, joinRoom, startGame, nextQuestion, endGame } from '@quizzmaster-backend/room-service/src/features/room/service/room.service.js'
import { findRoomById, updateStatus } from '@quizzmaster-backend/room-service/src/features/room/repository/room.repository.js'
import { valkey } from '@quizzmaster-backend/valkey-service/client.js'
import { publish } from '@quizzmaster-backend/valkey-service/publisher.js'
import { fetchLeaderboard } from '@quizzmaster-backend/room-service/src/features/leaderboard/service/leaderboard.service.js'

const {
    create: createSvc,
    getRoom: getRoomSvc,
    joinRoom: joinRoomSvc,
    startGame: startGameSvc,
    nextQuestion: nextQuestionSvc,
    endGame: endGameSvc,
} = await vi.importActual('./service/room.service.js')

const mockRoom = {
    id: 'ABC123',
    quizId: 1,
    status: 'WAITING',
    players: [{ id: 'p1', name: 'Alice', role: 'GAMEMASTER' }],
    checkpoints: [],
}

const mockQuestion = { id: 1, title: 'Q1', options: ['A', 'B'], timeLimit: 30 }

async function buildApp() {
    const app = Fastify()
    await app.register(roomRoutes)
    return app
}

// --- Controller ---

describe('POST / (create room)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('crée une room et retourne 201', async () => {
        create.mockResolvedValue(mockRoom)
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/',
            payload: { quizId: 1, pseudo: 'Alice' },
        })

        expect(res.statusCode).toBe(201)
        expect(res.json().id).toBe('ABC123')
        expect(create).toHaveBeenCalledWith(1, 'Alice')
    })

    it('retourne 400 si quizId manquant', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/',
            payload: { pseudo: 'Alice' },
        })

        expect(res.statusCode).toBe(400)
    })

    it('retourne 400 si pseudo manquant', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/',
            payload: { quizId: 1 },
        })

        expect(res.statusCode).toBe(400)
    })
})

describe('GET /:id (get room)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne la room avec status 200', async () => {
        getRoom.mockResolvedValue(mockRoom)
        const app = await buildApp()

        const res = await app.inject({ method: 'GET', url: '/ABC123' })

        expect(res.statusCode).toBe(200)
        expect(res.json().id).toBe('ABC123')
        expect(getRoom).toHaveBeenCalledWith('ABC123')
    })

    it('retourne 404 si la room est introuvable', async () => {
        const { NotFoundError } = await import('#errors')
        getRoom.mockRejectedValue(new NotFoundError('Room ABC123 introuvable'))
        const app = await buildApp()

        const res = await app.inject({ method: 'GET', url: '/ABC123' })

        expect(res.statusCode).toBe(404)
        expect(res.json().message).toContain('introuvable')
    })
})

describe('POST /:id/join', () => {
    beforeEach(() => vi.clearAllMocks())

    it('rejoint la room et retourne 200', async () => {
        const updatedRoom = { ...mockRoom, players: [...mockRoom.players, { id: 'p2', name: 'Bob', role: 'PLAYER' }] }
        joinRoom.mockResolvedValue(updatedRoom)
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/ABC123/join',
            payload: { pseudo: 'Bob', role: 'PLAYER' },
        })

        expect(res.statusCode).toBe(200)
        expect(joinRoom).toHaveBeenCalledWith('ABC123', 'Bob', 'PLAYER')
    })

    it('retourne 400 si pseudo manquant', async () => {
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/ABC123/join',
            payload: { role: 'PLAYER' },
        })

        expect(res.statusCode).toBe(400)
    })

    it('retourne 400 si pseudo déjà pris (BadRequestError)', async () => {
        const { BadRequestError } = await import('#errors')
        joinRoom.mockRejectedValue(new BadRequestError("Le pseudo 'Bob' est déjà pris dans cette salle."))
        const app = await buildApp()

        const res = await app.inject({
            method: 'POST',
            url: '/ABC123/join',
            payload: { pseudo: 'Bob', role: 'PLAYER' },
        })

        expect(res.statusCode).toBe(400)
    })
})

describe('POST /:id/start', () => {
    beforeEach(() => vi.clearAllMocks())

    it('démarre le jeu et retourne la première question', async () => {
        const mockStep = { room: 'ABC123', finished: false, currentQuestion: mockQuestion }
        startGame.mockResolvedValue(mockStep)
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/start' })

        expect(res.statusCode).toBe(200)
        expect(res.json().finished).toBe(false)
        expect(res.json().currentQuestion.id).toBe(1)
    })

    it('retourne 400 si la room a déjà démarré', async () => {
        const { BadRequestError } = await import('#errors')
        startGame.mockRejectedValue(new BadRequestError('La room a déjà démarré'))
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/start' })

        expect(res.statusCode).toBe(400)
    })

    it('retourne 404 si la room est introuvable', async () => {
        const { NotFoundError } = await import('#errors')
        startGame.mockRejectedValue(new NotFoundError('Room introuvable'))
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/start' })

        expect(res.statusCode).toBe(404)
    })
})

describe('POST /:id/next', () => {
    beforeEach(() => vi.clearAllMocks())

    it('avance à la question suivante', async () => {
        nextQuestion.mockResolvedValue({ room: 'ABC123', finished: false, currentQuestion: { id: 2, title: 'Q2' } })
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/next' })

        expect(res.statusCode).toBe(200)
        expect(res.json().finished).toBe(false)
    })

    it('retourne finished true à la dernière question', async () => {
        nextQuestion.mockResolvedValue({ room: 'ABC123', finished: true })
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/next' })

        expect(res.statusCode).toBe(200)
        expect(res.json().finished).toBe(true)
    })
})

describe('POST /:id/end', () => {
    beforeEach(() => vi.clearAllMocks())

    it('termine le jeu et retourne FINISHED', async () => {
        endGame.mockResolvedValue({ room: 'ABC123', status: 'FINISHED' })
        const app = await buildApp()

        const res = await app.inject({ method: 'POST', url: '/ABC123/end' })

        expect(res.statusCode).toBe(200)
        expect(res.json().status).toBe('FINISHED')
    })
})

// --- Service ---

describe('getRoom() (service)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne la room si elle existe', async () => {
        findRoomById.mockResolvedValue(mockRoom)

        const result = await getRoomSvc('ABC123')

        expect(result.id).toBe('ABC123')
    })

    it('lève NotFoundError si la room est absente', async () => {
        findRoomById.mockResolvedValue(null)

        await expect(getRoomSvc('NOPE')).rejects.toThrow('introuvable')
    })
})

describe('startGame() (service)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('lève BadRequestError si la room n\'est pas en WAITING', async () => {
        findRoomById.mockResolvedValue({ ...mockRoom, status: 'PLAYING' })

        await expect(startGameSvc('ABC123')).rejects.toThrow('déjà démarré')
    })

    it('lève BadRequestError si le quiz n\'a aucune question', async () => {
        findRoomById.mockResolvedValue(mockRoom)
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        })

        await expect(startGameSvc('ABC123')).rejects.toThrow('Aucune question')
    })

    it('lève BadRequestError si le service quiz répond KO', async () => {
        findRoomById.mockResolvedValue(mockRoom)
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        })

        await expect(startGameSvc('ABC123')).rejects.toThrow('Impossible de charger les questions')
    })

    it('démarre le jeu, stocke les questions et publie game.started', async () => {
        findRoomById.mockResolvedValue(mockRoom)
        const questions = [mockQuestion, { id: 2, title: 'Q2', options: ['C', 'D'], timeLimit: 20 }]
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(questions),
        })
        valkey.set.mockResolvedValue('OK')
        valkey.hset.mockResolvedValue(1)
        updateStatus.mockResolvedValue({})

        const result = await startGameSvc('ABC123')

        expect(result.finished).toBe(false)
        expect(result.currentQuestion.id).toBe(1)
        expect(publish).toHaveBeenCalledWith('game.started', expect.objectContaining({ roomId: 'ABC123' }))
    })
})

describe('nextQuestion() (service)', () => {
    beforeEach(() => vi.clearAllMocks())

    const questions = [mockQuestion, { id: 2, title: 'Q2', options: ['C'], timeLimit: 20 }]

    it('retourne la question suivante', async () => {
        valkey.get.mockResolvedValue(JSON.stringify(questions))
        valkey.hget.mockResolvedValue('0')
        valkey.hset.mockResolvedValue(1)
        valkey.del.mockResolvedValue(1)
        valkey.set.mockResolvedValue('OK')

        const result = await nextQuestionSvc('ABC123')

        expect(result.finished).toBe(false)
        expect(result.currentQuestion.id).toBe(2)
        expect(publish).toHaveBeenCalledWith('question.changed', expect.objectContaining({ roomId: 'ABC123' }))
    })

    it('termine la partie si on est à la dernière question', async () => {
        valkey.get.mockResolvedValue(JSON.stringify(questions))
        valkey.hget.mockResolvedValue('1') // déjà sur la dernière
        // endGame va appeler ces mocks
        valkey.del.mockResolvedValue(1)
        updateStatus.mockResolvedValue({})
        fetchLeaderboard.mockResolvedValue({ roomId: 'ABC123', leaderboard: [] })

        const result = await nextQuestionSvc('ABC123')

        expect(result.finished).toBe(true)
    })

    it('lève NotFoundError si aucune question en cache', async () => {
        valkey.get.mockResolvedValue(null)

        await expect(nextQuestionSvc('ABC123')).rejects.toThrow('Aucune question')
    })
})

describe('endGame() (service)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('supprime les clés valkey, met à jour le status et publie game.ended', async () => {
        valkey.del.mockResolvedValue(1)
        updateStatus.mockResolvedValue({})
        fetchLeaderboard.mockResolvedValue({ roomId: 'ABC123', leaderboard: [{ userId: 'Alice', score: 3 }] })

        const result = await endGameSvc('ABC123')

        expect(result).toEqual({ room: 'ABC123', status: 'FINISHED' })
        expect(updateStatus).toHaveBeenCalledWith('ABC123', 'FINISHED')
        expect(publish).toHaveBeenCalledWith('game.ended', expect.objectContaining({ roomId: 'ABC123' }))
    })
})