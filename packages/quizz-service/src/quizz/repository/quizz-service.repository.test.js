import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuizzRepository } from './quizz-service.repository.js'

vi.mock('../../../../prisma/src/prisma.js', () => ({
    prisma: {
        quiz: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            delete: vi.fn(),
        }
    }
}))

import { prisma } from '../../../../prisma/src/prisma.js'

describe('QuizzRepository', () => {
    let repo

    beforeEach(() => {
        repo = new QuizzRepository()
        vi.clearAllMocks()
    })

    it('create', async () => {
        prisma.quiz.create.mockResolvedValue({ id: 1, title: 'Test' })

        const result = await repo.create({ title: 'Test' })

        expect(result.id).toBe(1)
    })

    it('findById', async () => {
        prisma.quiz.findUnique.mockResolvedValue({ id: 1, title: 'Test' })

        const result = await repo.findById(1)

        expect(result.id).toBe(1)
    })

    it('findById returns null', async () => {
        prisma.quiz.findUnique.mockResolvedValue(null)

        const result = await repo.findById(1)

        expect(result).toBeNull()
    })

    it('findAll', async () => {
        prisma.quiz.findMany.mockResolvedValue([{ id: 1, title: 'Test' }])

        const result = await repo.findAll()

        expect(result).toHaveLength(1)
    })

    it('delete', async () => {
        prisma.quiz.delete.mockResolvedValue({ id: 1, title: 'Test' })

        const result = await repo.delete(1)

        expect(result.id).toBe(1)
    })

    it('delete returns null on P2025', async () => {
        prisma.quiz.delete.mockRejectedValue({ code: 'P2025' })

        const result = await repo.delete(1)

        expect(result).toBeNull()
    })
})