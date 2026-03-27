import {SCORE_SERVICE} from "../../../config/services.js";
import {valkey} from "../../../../../valkey/client.js";
import {NotFoundError, RoomError} from "#errors";

export async function recoverRoom(roomId) {
    const res = await fetch(`${SCORE_SERVICE}/checkpoint/${roomId}/last`)
    if (!res.ok) {
        if (res.status === 404) throw new NotFoundError(`Checkpoint introuvable pour la room ${roomId}`)
        throw new RoomError('Erreur lors de la communication avec le service de score', 500)
    }

    const checkpoint = await res.json()

    if (!checkpoint) {
        throw new NotFoundError(`Aucun checkpoint trouvé pour la room ${roomId}`)
    }

    for (const { userId, score } of checkpoint.scores) {
        await valkey.zadd(`leaderboard:${roomId}`, score, userId)
    }

    await valkey.hset(`room:${roomId}:currentQuestion`, {
        data: JSON.stringify({ id: checkpoint.questionId }),
        index: 0 // faut je vois avec chalk
    })

    return {
        roomId,
        questionId: checkpoint.questionId,
        scores: checkpoint.scores,
    }
}