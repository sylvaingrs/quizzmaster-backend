import {submitAnswer, getLeaderboard, setCurrent, getCurrent} from '../services/scoring.js'
import {eventBus} from '../../events/eventBus.js'
import {valkey} from '../../config/valkey.js'
import {prisma} from "../../config/prisma.js";

export async function roomRoutes(app) {
  app.post('/:id/start', {
    schema: {
      tags: ['Quiz'],
      body: {
        type: 'object',
        required: ['quiz_id', 'first_question_id'],
        properties: {
          quiz_id: {type: 'string'},
          first_question_id: {type: 'string'}
        }
      }
    }
  }, async (req, reply) => {
    const roomId = req.params.id
    const {quiz_id: quizId, first_question_id: firstQuestionId} = req.body

    await setCurrent(roomId, firstQuestionId)
    await valkey.del(`leaderboard:${roomId}`)

    return reply.send({
      message: '🚀 Partie initialisée dans Valkey avec succès !',
      roomId,
      quizId,
      currentQuestion: firstQuestionId
    })
  })

  app.post('/:id/answer', {
    schema: {
      tags: ['Quiz'],
      params: {
        type: 'object',
        properties: {
          id: {type: 'string'}
        }
      },
      body: {
        type: 'object',
        required: ['quiz_id', 'userId', 'answer', 'correct_answer', 'question_id'],
        properties: {
          quiz_id: {type: 'string'},
          userId: {type: 'string'},
          answer: {type: 'string'},
          correct_answer: {type: 'string'},
          question_id: {type: 'string'}
        }
      }
    }
  }, async (req, _) => {
    const roomId = req.params.id
    const {quiz_id: quizId, userId, answer, correct_answer: correctAnswer, question_id: questionId} = req.body

    await submitAnswer(roomId, quizId, userId, answer, correctAnswer, questionId)
    return {ok: true}
  })

  app.get('/:id/leaderboard', {
    schema: {
      tags: ['Quiz']
    }
  }, async (req, _) => {
    return await getLeaderboard(req.params.id)
  })

  app.post('/:id/end', {
    schema: {
      tags: ['Quiz'],
      params: {
        type: 'object',
        properties: {
          id: {type: 'string'}
        }
      },
      body: {
        type: 'object',
        required: ['quiz_id'],
        properties: {
          quiz_id: {type: 'string'}
        }
      }
    }
  }, async (req, reply) => {
    const roomId = req.params.id
    const {quiz_id: quizId} = req.body

    const finalScores = await getLeaderboard(roomId)
    const questionId = await getCurrent(roomId)

    eventBus.emit('quiz.ended', {roomId, quizId, questionId, finalScores})

    return reply.send({message: 'Quiz terminé, cache Valkey nettoyé !'})
  })
}
