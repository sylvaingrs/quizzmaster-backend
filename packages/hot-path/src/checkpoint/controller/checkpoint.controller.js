import {recoverRoom} from "../services/checkpoint.service.js";

export async function checkpointRoutes(app) {
  app.post('/:roomId/recover', {
    schema: {
      tags: ['Checkpoint'],
      params: {
        type: 'object',
        properties: {
          roomId: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    const checkpoint = await recoverRoom(req.params.roomId)
    return reply.send({
      message: '✅ Room restaurée depuis le dernier checkpoint',
      roomId: req.params.roomId,
      questionId: checkpoint.questionId,
      scores: checkpoint.scores
    })
  })
}
