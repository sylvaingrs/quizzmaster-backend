import { eventBus } from '../events/eventBus.js'
import { persistCheckpoint } from './services/checkpoint.service.js'
import { valkey } from '../config/valkey.js'

export function startConsumer() {
  eventBus.on('question.ended', async ({ roomId, quizId, questionId, scores }) => {
    await persistCheckpoint(roomId, quizId, questionId, scores)
    console.log(`📸 [Checkpoint] Room ${roomId} | Quiz ${quizId} | Question ${questionId} ✅`)
  })

  eventBus.on('quiz.ended', async ({ roomId, quizId, questionId, finalScores }) => {
    if (questionId) {
      await persistCheckpoint(roomId, quizId, questionId, finalScores)
      console.log(`📸 [Dernier Checkpoint] Room ${roomId} sauvegarde finale ✅`)
    }

    await valkey.del(`leaderboard:${roomId}`)
    await valkey.del(`room:${roomId}:currentQuestion`)
  })
}
