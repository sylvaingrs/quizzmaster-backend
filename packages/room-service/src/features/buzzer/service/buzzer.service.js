/** @typedef {import('../controller/dto/buzzer.dto.d.ts').AnswerDto} AnswerDto */
/** @typedef {import('../controller/dto/buzzer.dto.d.ts').BuzzResponseDto} BuzzResponseDto */
/** @typedef {import('../controller/dto/buzzer.dto.d.ts').AnswerResponseDto} AnswerResponseDto */

import {getBuzzer, getCurrentQuestion, resetBuzzer, tryBuzz} from "../repository/buzzer.repository.js";
import {valkey} from "@quizzmaster-backend/valkey-service/client.js";
import {publish} from "../../../../../valkey/publisher.js";
import {BadRequestError, NotFoundError} from "#errors";

/**
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<BuzzResponseDto>}
 */
export async function buzz(roomId, userId) {
    const canBuzz = await tryBuzz(roomId, userId)

    // Ici je vais devoir rajouter le WS

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
    const isCorrect = question.correctAnswer.includes(answerDto.answer)

    if (isCorrect) {
        await valkey.zincrby(`leaderboard:${roomId}`, 1, answerDto.userId)
        const scores = await valkey.zrevrange(`leaderboard:${roomId}`, 0, -1, 'WITHSCORES')
        publish('scores.updated', {roomId: roomId, leaderboard: scores})
    }
    await resetBuzzer(roomId)
    publish('buzzer.reset', {roomId})

    return {correct: isCorrect, userId: answerDto.userId}
}