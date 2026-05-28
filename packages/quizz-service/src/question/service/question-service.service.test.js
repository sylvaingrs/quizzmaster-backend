import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuestionService } from './question-service.service.js'

describe('QuestionService', () => {
    let service

    const mockQuestionRepo = {
        findAll: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }

    const mockQuizzRepo = {
        findById: vi.fn(),
    }

    beforeEach(() => {
        service = new QuestionService()

        service.repository = mockQuestionRepo
        service.quizzRepository = mockQuizzRepo

        vi.clearAllMocks()
    })

    describe('findAllQuestions', () => {
        it('should return questions if quizz exists', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.findAll.mockResolvedValue([{ id: 1 }])

            const result = await service.findAllQuestions(1)

            expect(result).toHaveLength(1)
            expect(mockQuestionRepo.findAll).toHaveBeenCalledWith(1)
        })

        it('should throw 404 if quizz does not exist', async () => {
            mockQuizzRepo.findById.mockResolvedValue(null)

            await expect(service.findAllQuestions(1))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })

    describe('findQuestion', () => {
        it('should return question', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.findById.mockResolvedValue({ id: 10 })

            const result = await service.findQuestion(1, 10)

            expect(result.id).toBe(10)
        })

        it('should throw 404 if question not found', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.findById.mockResolvedValue(null)

            await expect(service.findQuestion(1, 10))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })

    describe('createQuestion', () => {
        it('should create question', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.create.mockResolvedValue({ id: 5 })

            const result = await service.createQuestion(1, { title: 'Q' })

            expect(result.id).toBe(5)
            expect(mockQuestionRepo.create).toHaveBeenCalled()
        })
    })

    describe('updateQuestion', () => {
        it('should update question', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.update.mockResolvedValue({ id: 5 })

            const result = await service.updateQuestion(1, 5, { title: 'New' })

            expect(result.id).toBe(5)
        })

        it('should throw 404 if question not found', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.update.mockResolvedValue(null)

            await expect(service.updateQuestion(1, 5, {}))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })

    describe('deleteQuestion', () => {
        it('should delete question', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.delete.mockResolvedValue({ id: 5 })

            const result = await service.deleteQuestion(1, 5)

            expect(result.id).toBe(5)
        })

        it('should throw 404 if not found', async () => {
            mockQuizzRepo.findById.mockResolvedValue({ id: 1 })
            mockQuestionRepo.delete.mockResolvedValue(null)

            await expect(service.deleteQuestion(1, 5))
                .rejects.toMatchObject({ statusCode: 404 })
        })
    })
})