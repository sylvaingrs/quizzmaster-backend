import {getLastCheckpoint, saveCheckpoint} from '../repository/checkpoint.repository.js'
import { valkey } from '../../config/valkey.js'


export async function persistCheckpoint(roomId, quizId, questionId, scores) {
  await saveCheckpoint(roomId, quizId, questionId, scores)
}

export async function recoverRoom(roomId) {
  const checkpoint = await getLastCheckpoint(roomId)

  if (!checkpoint) {
    throw new Error(`Aucun checkpoint trouvé pour la room ${roomId}`)
  }

  for (const { userId, score } of checkpoint.scores) {
    await valkey.zadd(`leaderboard:${roomId}`, score, userId)
  }
  
  await valkey.set(`room:${roomId}:currentQuestion`, checkpoint.questionId)

  return checkpoint
}
