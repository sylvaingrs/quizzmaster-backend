import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

vi.mock('./service/leaderboard.service.js', () => ({
    fetchLeaderboard: vi.fn(),
}))

vi.mock('./repository/leaderboard.repository.js', () => ({
    getLeaderboard: vi.fn(),
}))

vi.mock('@quizzmaster-backend/valkey-service/client.js', () => ({
    valkey: { hgetall: vi.fn(), zrevrange: vi.fn() },
}))

import { leaderboardRoutes } from './controller/leaderboard.controller.js'
import { fetchLeaderboard } from './service/leaderboard.service.js'  // ✅ mock, pour les tests controller
import { getLeaderboard } from './repository/leaderboard.repository.js'
import { valkey } from '@quizzmaster-backend/valkey-service/client.js'

const { fetchLeaderboard: fetchLeaderboardSvc } = await vi.importActual(
    './service/leaderboard.service.js'
)

async function buildApp() {
    const app = Fastify()
    await app.register(leaderboardRoutes)
    return app
}

// --- Controller ---

describe('GET /:id (leaderboard controller)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retourne le leaderboard avec status 200', async () => {
        const mockLb = {
            roomId: 'room1',
            leaderboard: [
                { userId: 'Alice', score: 100 },
                { userId: 'Bob', score: 80 },
            ],
        }
        fetchLeaderboard.mockResolvedValue(mockLb)
        const app = await buildApp()

        const res = await app.inject({ method: 'GET', url: '/room1' })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual(mockLb)
        expect(fetchLeaderboard).toHaveBeenCalledWith('room1')
    })

    it('retourne un leaderboard vide si personne n\'a de score', async () => {
        fetchLeaderboard.mockResolvedValue({ roomId: 'room1', leaderboard: [] })
        const app = await buildApp()

        const res = await app.inject({ method: 'GET', url: '/room1' })

        expect(res.statusCode).toBe(200)
        expect(res.json().leaderboard).toEqual([])
    })

    it('retourne 500 si le service lève une erreur inattendue', async () => {
        fetchLeaderboard.mockRejectedValue(new Error('Valkey down'))
        const app = await buildApp()

        const res = await app.inject({ method: 'GET', url: '/room1' })

        expect(res.statusCode).toBe(500)
    })
})

// --- Service ---

describe('fetchLeaderboard() (service)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getLeaderboard.mockResolvedValue([])
        valkey.hgetall.mockResolvedValue({})
    })
    it('mappe correctement les scores avec les noms des joueurs', async () => {
        getLeaderboard.mockResolvedValue(['user1', '100', 'user2', '50'])
        valkey.hgetall.mockResolvedValue({
            user1: JSON.stringify({ name: 'Alice', role: 'PLAYER' }),
            user2: JSON.stringify({ name: 'Bob', role: 'PLAYER' }),
        })

        const result = await fetchLeaderboardSvc('room1')

        expect(result.roomId).toBe('room1')
        expect(result.leaderboard).toEqual([
            { userId: 'Alice', score: 100 },
            { userId: 'Bob', score: 50 },
        ])
    })

    it('ajoute les joueurs sans score avec 0', async () => {
        getLeaderboard.mockResolvedValue([])
        valkey.hgetall.mockResolvedValue({
            user1: JSON.stringify({ name: 'Charlie', role: 'PLAYER' }),
        })

        const result = await fetchLeaderboardSvc('room1')

        expect(result.leaderboard).toEqual([{ userId: 'Charlie', score: 0 }])
    })

    it('n\'ajoute pas les spectateurs sans score', async () => {
        getLeaderboard.mockResolvedValue([])
        valkey.hgetall.mockResolvedValue({
            user1: JSON.stringify({ name: 'Obs', role: 'SPECTATOR' }),
        })

        const result = await fetchLeaderboardSvc('room1')

        expect(result.leaderboard).toEqual([])
    })

    it('utilise l\'userId brut si le joueur est absent du playerMap', async () => {
        getLeaderboard.mockResolvedValue(['unknownUser', '30'])
        valkey.hgetall.mockResolvedValue({})

        const result = await fetchLeaderboardSvc('room1')

        expect(result.leaderboard[0].userId).toBe('unknownUser')
        expect(result.leaderboard[0].score).toBe(30)
    })

    it('ne duplique pas les joueurs déjà présents dans les scores', async () => {
        getLeaderboard.mockResolvedValue(['user1', '10'])
        valkey.hgetall.mockResolvedValue({
            user1: JSON.stringify({ name: 'Alice', role: 'PLAYER' }),
        })

        const result = await fetchLeaderboardSvc('room1')

        expect(result.leaderboard).toHaveLength(1)
    })

    it('retourne un leaderboard vide si pas de scores et pas de joueurs', async () => {
        getLeaderboard.mockResolvedValue([])
        valkey.hgetall.mockResolvedValue(null)

        const result = await fetchLeaderboardSvc('room1')

        expect(result.leaderboard).toEqual([])
    })
})