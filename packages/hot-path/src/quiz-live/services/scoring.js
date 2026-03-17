import { updateScore, getScores, setCurrentQuestion, getCurrentQuestion } from '../repositories/valkey.repository.js'
import { eventBus } from '../../events/eventBus.js'

export async function getLeaderboard(roomId) {
  return await getScores(roomId)
}

export async function submitAnswer(roomId, quizId, userId, answer, correctAnswer, questionId) {
  if (answer === correctAnswer) {
    await updateScore(roomId, userId)
    const scores = await getLeaderboard(roomId)
    eventBus.emit('question.ended', { roomId, quizId, questionId, scores })
  }
}

export async function setCurrent(roomId, questionId) {
  await setCurrentQuestion(roomId, questionId)
}

export async function getCurrent(roomId) {
  return await getCurrentQuestion(roomId)
}
