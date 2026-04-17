import { prisma } from "@quizzmaster-backend/prisma";
import { NotFoundError } from "#errors";

export async function getLastCheckpoint(roomId) {
    const checkpoint = await prisma.checkpoint.findFirst({
        where: {
            roomId: roomId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            quiz: true,
            question: true
        }
    });

    if (!checkpoint) {
        throw new NotFoundError('No checkpoint found for this room');
    }

    return checkpoint;
}

export async function saveCheckpoint(data) {
    const { roomId, questionId, quizId, scores } = data;
    
    return prisma.checkpoint.upsert({
        where: {
            roomId_questionId: {
                roomId,
                questionId
            }
        },
        update: {
            scores,
            quizId
        },
        create: {
            roomId,
            questionId,
            quizId,
            scores
        }
    });
}
