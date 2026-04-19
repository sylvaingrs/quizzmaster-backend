import {SCORE_SERVICE, QUIZ_SERVICE} from "../../../config/services.js";
import {valkey} from "@quizzmaster-backend/valkey-service/client.js";
import {publish} from "@quizzmaster-backend/valkey-service/publisher.js";
import {NotFoundError, RoomError} from "#errors";
import {getRoom} from "../../room/service/room.service.js";
import {updateStatus} from "../../room/repository/room.repository.js";
import {findPlayingRooms} from "../repository/checkpoint.repository.js";

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

    const room = await getRoom(roomId);
    if (room && room.players) {
        for (const player of room.players) {
            await valkey.hset(`room:${roomId}:players`, {
                [player.id]: JSON.stringify({name: player.name, role: player.role})
            })
        }
    }

    await Promise.all([
        valkey.del(`leaderboard:${roomId}`),
        valkey.del(`room:${roomId}:buzzer`)
    ]);

    for (const {userId, score} of checkpoint.scores) {
        await valkey.zadd(`leaderboard:${roomId}`, score, userId)
    }

    const resQuiz = await fetch(`${QUIZ_SERVICE}/quizz/${checkpoint.quizId}/questions`)
    if (!resQuiz.ok) throw new RoomError('Impossible de charger les questions', 500)
    const questions = await resQuiz.json()

    const index = questions.findIndex(q => q.id === checkpoint.questionId)
    const currentIndex = index >= 0 ? index : 0;
    const currentQuestion = questions[currentIndex];

    await Promise.all([
        valkey.set(`room:${roomId}:questions`, JSON.stringify(questions)),
        valkey.hset(`room:${roomId}:currentQuestion`, {
            data: JSON.stringify(currentQuestion),
            index: currentIndex
        }),
        valkey.set(`room:${roomId}:timer`, currentQuestion.timeLimit ?? 30),
        updateStatus(roomId, 'PLAYING')
    ]);

    publish('game.started', {roomId: roomId, currentQuestion: currentQuestion});
    publish('scores.updated', {roomId: roomId, leaderboard: checkpoint.scores});

    return {
        roomId,
        questionId: currentQuestion.id,
        scores: checkpoint.scores,
    }
}

export async function autoRecoverPlayingRooms() {
    const rooms = await findPlayingRooms();
    for (const room of rooms) {
        const current = await valkey.hget(`room:${room.id}:currentQuestion`, 'data');
        if (!current) {
            await recoverRoom(room.id)
        }
    }
}