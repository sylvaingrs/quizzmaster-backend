import { prisma } from '../../config/prisma.js'

export async function saveCheckpoint(roomId, quizId, questionId, scores) {
  await prisma.checkpoint.upsert({
    where: {
      roomId_questionId: { roomId, questionId }
    },
    update: { scores },
    create: { roomId, quizId, questionId, scores }
  })
}

export async function getLastCheckpoint(roomId) {
  return prisma.checkpoint.findFirst({
    where: {roomId},
    orderBy: {updatedAt: 'desc'}
  });
}
