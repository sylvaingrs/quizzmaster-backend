/** @typedef {import('../controller/dto/buzzer.dto.d.ts').AnswerDto} AnswerDto */
/** @typedef {import('../controller/dto/buzzer.dto.d.ts').BuzzResponseDto} BuzzResponseDto */
/** @typedef {import('../controller/dto/buzzer.dto.d.ts').AnswerResponseDto} AnswerResponseDto */

import {getBuzzer, getCurrentQuestion, resetBuzzer, tryBuzz} from "../repository/buzzer.repository.js";
import {valkey} from "@quizzmaster-backend/valkey-service/client.js";
import {publish} from "@quizzmaster-backend/valkey-service/publisher.js";
import {publish as rmqPublish} from "@quizzmaster-backend/rabbitmq-service/publisher.js";
import {BadRequestError, NotFoundError} from "#errors";
import {fetchLeaderboard} from "../../leaderboard/service/leaderboard.service.js";
import {QUEUES} from "@quizzmaster-backend/rabbitmq-service/queues.js";
import {getRoom} from "../../room/service/room.service.js";
/**
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<BuzzResponseDto>}
 */
export async function buzz(roomId, userId) {
    const canBuzz = await tryBuzz(roomId, userId)

    if (canBuzz){
        publish('buzzer.taken', { roomId: roomId, userId: userId })
    }

    return {
        success: canBuzz,
        userId: userId
    }
}

/**
 * @param {string} roomId
 * @param {AnswerDto} answerDto
 * @returns {Promise<AnswerResponseDto>}
 */
export async function answer(roomId, answerDto) {
    const buzzer = await getBuzzer(roomId)
    if (buzzer !== answerDto.userId) {
        throw new BadRequestError("User did not buzz or is not the first to buzz");
    }

    const currentQuestion = await getCurrentQuestion(roomId)
    if (!currentQuestion) {
        throw new NotFoundError("No current question found for this room");
    }

    const question = JSON.parse(currentQuestion.data)
    
    const expected = question.correctAnswer || [];
    const provided = answerDto.answer || [];

    let isCorrect = false;
    if (Array.isArray(provided) && provided.length > 0 && provided.length === expected.length) {
        isCorrect = expected.every(e => provided.includes(e));
    }

    if (isCorrect) {
        await valkey.zincrby(`leaderboard:${roomId}`, 1, answerDto.userId)
        const leaderboardData = await fetchLeaderboard(roomId)
        const room = await getRoom(roomId);

        publish('scores.updated', {roomId: roomId, leaderboard: leaderboardData.leaderboard})
        publish('answer.result', { roomId, userId: answerDto.userId, correct: true, expected })
        try {
            await rmqPublish(QUEUES.SCORE_PERSISTENCE, {
                roomId: roomId,
                questionId: question.id,
                quizId: room.quizId,
                scores: leaderboardData.leaderboard
            })
        } catch (e) {
            throw new Error(`Erreur lors de l'envoi du message RabbitMQ: ${e.message}`)
        }
        return {correct: isCorrect, userId: answerDto.userId}
    }
    
    publish('answer.result', { roomId, userId: answerDto.userId, correct: false })
    await resetBuzzer(roomId)
    publish('buzzer.reset', {roomId})

    return {correct: isCorrect, userId: answerDto.userId}
}