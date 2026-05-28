import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as repo from '../repository/buzzer.repository.js'
import { buzz, answer } from './buzzer.service.js'

// mocks externes
vi.mock('@quizzmaster-backend/valkey-service/client.js', () => ({
    valkey: {
        zincrby: vi.fn()
    }
}))

vi.mock('@quizzmaster-backend/valkey-service/publisher.js', () => ({
    publish: vi.fn()
}))

vi.mock('@quizzmaster-backend/rabbitmq-service/publisher.js', () => ({
    publish: vi.fn()
}))

vi.mock('../../leaderboard/service/leaderboard.service.js', () => ({
    fetchLeaderboard: vi.fn()
}))

vi.mock('../../room/service/room.service.js', () => ({
    getRoom: vi.fn()
}))

import { publish } from '@quizzmaster-backend/valkey-service/publisher.js'
import { publish as rmqPublish } from '@quizzmaster-backend/rabbitmq-service/publisher.js'
import { fetchLeaderboard } from '../../leaderboard/service/leaderboard.service.js'
import { getRoom } from '../../room/service/room.service.js'
import { valkey } from '@quizzmaster-backend/valkey-service/client.js'

describe('Buzzer Service', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // -------------------
    // BUZZ
    // -------------------
    describe('buzz', () => {
        it('should allow first user to buzz', async () => {
            vi.spyOn(repo, 'tryBuzz').mockResolvedValue(true)

            const result = await buzz('room1', 'user1')

            expect(result.success).toBe(true)
            expect(publish).toHaveBeenCalledWith('buzzer.taken', {
                roomId: 'room1',
                userId: 'user1'
            })
        })

        it('should reject if already buzzed', async () => {
            vi.spyOn(repo, 'tryBuzz').mockResolvedValue(false)

            const result = await buzz('room1', 'user1')

            expect(result.success).toBe(false)
            expect(publish).not.toHaveBeenCalled()
        })
    })

    // -------------------
    // ANSWER
    // -------------------
    describe('answer', () => {

        it('should throw if user is not buzzer', async () => {
            vi.spyOn(repo, 'getBuzzer').mockResolvedValue('user2')

            await expect(answer('room1', { userId: 'user1', answer: [] }))
                .rejects.toThrow()
        })

        it('should throw if no question', async () => {
            vi.spyOn(repo, 'getBuzzer').mockResolvedValue('user1')
            vi.spyOn(repo, 'getCurrentQuestion').mockResolvedValue(null)

            await expect(answer('room1', { userId: 'user1', answer: [] }))
                .rejects.toThrow()
        })

        it('should handle correct answer', async () => {
            vi.spyOn(repo, 'getBuzzer').mockResolvedValue('user1')
            vi.spyOn(repo, 'getCurrentQuestion').mockResolvedValue({
                data: JSON.stringify({
                    id: 1,
                    correctAnswer: ['a']
                })
            })

            fetchLeaderboard.mockResolvedValue({
                leaderboard: [{ userId: 'user1', score: 1 }]
            })

            getRoom.mockResolvedValue({ quizId: 10 })

            const result = await answer('room1', {
                userId: 'user1',
                answer: ['a']
            })

            expect(result.correct).toBe(true)

            expect(valkey.zincrby).toHaveBeenCalled()
            expect(publish).toHaveBeenCalledWith(
                'answer.result',
                expect.objectContaining({ correct: true })
            )
            expect(rmqPublish).toHaveBeenCalled()
        })

        it('should handle incorrect answer', async () => {
            vi.spyOn(repo, 'getBuzzer').mockResolvedValue('user1')
            vi.spyOn(repo, 'getCurrentQuestion').mockResolvedValue({
                data: JSON.stringify({
                    correctAnswer: ['a']
                })
            })

            vi.spyOn(repo, 'resetBuzzer').mockResolvedValue()

            const result = await answer('room1', {
                userId: 'user1',
                answer: ['b']
            })

            expect(result.correct).toBe(false)

            expect(publish).toHaveBeenCalledWith(
                'answer.result',
                expect.objectContaining({ correct: false })
            )

            expect(repo.resetBuzzer).toHaveBeenCalled()
        })
    })
})