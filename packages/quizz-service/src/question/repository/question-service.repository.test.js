import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuestionRepository } from './question-service.repository.js'

// mock du module prisma
vi.mock('@quizzmaster-backend/prisma', () => {
    return {
        prisma: {
            question: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            }
        }
    }
})

// on récupère le mock
import { prisma } from '@quizzmaster-backend/prisma'

describe('QuestionRepository', () => {
    let repo

    beforeEach(() => {
        repo = new QuestionRepository()
        vi.clearAllMocks()
    })

    describe('findAll', () => {
        it('should return mapped entities', async () => {
            prisma.question.findMany.mockResolvedValue([
                { id: 1, quizId: 1, title: 'Q', options: [], correctAnswer: [], timeLimit: 30 }
            ])

            const result = await repo.findAll(1)

            expect(result).toHaveLength(1)
            expect(result[0]).toHaveProperty('id', 1)
            expect(prisma.question.findMany).toHaveBeenCalledWith({
                where: { quizId: 1 }
            })
        })
    })

    describe('findById', () => {
        it('should return entity if found', async () => {
            prisma.question.findFirst.mockResolvedValue({
                id: 1, quizId: 1, title: 'Q', options: [], correctAnswer: [], timeLimit: 30
            })

            const result = await repo.findById(1, 1)

            expect(result).not.toBeNull()
            expect(result.id).toBe(1)
        })

        it('should return null if not found', async () => {
            prisma.question.findFirst.mockResolvedValue(null)

            const result = await repo.findById(1, 1)

            expect(result).toBeNull()
        })
    })

    describe('create', () => {
        it('should create question', async () => {
            prisma.question.create.mockResolvedValue({
                id: 2, quizId: 1, title: 'Q', options: [], correctAnswer: [], timeLimit: 30
            })

            const result = await repo.create(1, { title: 'Q' })

            expect(result.id).toBe(2)
            expect(prisma.question.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ quizId: 1 })
            })
        })
    })

    describe('update', () => {
        it('should update question', async () => {
            prisma.question.update.mockResolvedValue({
                id: 1, quizId: 1, title: 'Updated', options: [], correctAnswer: [], timeLimit: 30
            })

            const result = await repo.update(1, 1, { title: 'Updated' })

            expect(result.title).toBe('Updated')
        })

        it('should return null on P2025', async () => {
            prisma.question.update.mockRejectedValue({ code: 'P2025' })

            const result = await repo.update(1, 1, {})

            expect(result).toBeNull()
        })

        it('should throw other errors', async () => {
            prisma.question.update.mockRejectedValue(new Error('DB crash'))

            await expect(repo.update(1, 1, {})).rejects.toThrow('DB crash')
        })
    })

    describe('delete', () => {
        it('should delete question', async () => {
            prisma.question.delete.mockResolvedValue({
                id: 1, quizId: 1, title: 'Q', options: [], correctAnswer: [], timeLimit: 30
            })

            const result = await repo.delete(1, 1)

            expect(result.id).toBe(1)
        })

        it('should return null on P2025', async () => {
            prisma.question.delete.mockRejectedValue({ code: 'P2025' })

            const result = await repo.delete(1, 1)

            expect(result).toBeNull()
        })
    })
})