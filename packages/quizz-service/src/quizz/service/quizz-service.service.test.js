import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuizzService } from './quizz-service.service.js'

describe('QuizzService', () => {
    let service

    const mockRepo = {
        create: vi.fn(),
        findById: vi.fn(),
        findAll: vi.fn(),
        delete: vi.fn(),
    }

    beforeEach(() => {
        service = new QuizzService()
        service.repository = mockRepo
        vi.clearAllMocks()
    })

    describe('createQuizz', () => {
        it('should create a quizz', async () => {
            mockRepo.create.mockResolvedValue({ id: 1, title: 'Test' })

            const result = await service.createQuizz({ title: 'Test' })

            expect(result.id).toBe(1)
            expect(mockRepo.create).toHaveBeenCalledWith({ title: 'Test' })
        })
    })

    describe('findQuizz', () => {
        it('should return a quizz', async () => {
            mockRepo.findById.mockResolvedValue({ id: 1, title: 'Test' })

            const result = await service.findQuizz(1)

            expect(result.id).toBe(1)
        })

        it('should throw 404 if not found', async () => {
            mockRepo.findById.mockResolvedValue(null)

            await expect(service.findQuizz(1))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })

    describe('findAllQuizz', () => {
        it('should return all quizz', async () => {
            mockRepo.findAll.mockResolvedValue([{ id: 1 }])

            const result = await service.findAllQuizz()

            expect(result).toHaveLength(1)
        })
    })

    describe('deleteQuizz', () => {
        it('should delete a quizz', async () => {
            mockRepo.delete.mockResolvedValue({ id: 1 })

            const result = await service.deleteQuizz(1)

            expect(result.id).toBe(1)
        })

        it('should throw 404 if not found', async () => {
            mockRepo.delete.mockResolvedValue(null)

            await expect(service.deleteQuizz(1))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })
})