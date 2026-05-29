import { prisma } from "@quizzmaster-backend/prisma";

/**
 * @typedef {import('./entity/score.entity.d.ts').CheckpointEntity} CheckpointEntity
 */

/**
 * @param {string} roomId
 * @returns {Promise<CheckpointEntity | null>}
 */
export async function findLastCheckpoint(roomId) {
    return prisma.checkpoint.findFirst({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        include: {
            quiz: true,
            question: true
        }
    });
}

/**
 * @param {{ roomId: string, questionId: number, quizId: number, scores: Record<string, number> }} data
 * @returns {Promise<CheckpointEntity>}
 */
export async function upsertCheckpoint(data) {
    const { roomId, questionId, quizId, scores } = data;

    return prisma.checkpoint.upsert({
        where: {
            roomId_questionId: { roomId, questionId }
        },
        update: { scores, quizId },
        create: { roomId, questionId, quizId, scores }
    });
}
