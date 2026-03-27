import {createRoom, findRoomById, updateStatus} from "../repository/room.repository.js";
import {QUIZ_SERVICE} from "../../config/services.js";
import {valkey} from "../../../../valkey/client.js"
import {publish} from "../../../../valkey/publisher.js";
import {BadRequestError, NotFoundError} from "../../errors.js";

/** @typedef {import('../repository/entity/room.entity.d.ts').RoomEntity} RoomEntity */
/** @typedef {import('../repository/entity/room.entity.d.ts').PlayerEntity} PlayerEntity */
/** @typedef {import('../controller/dto/room.dto.d.ts').RoomResponseDto} RoomResponseDto */
/** @typedef {import('../controller/dto/room.dto.d.ts').GameStepDto} GameStepDto */
/** @typedef {import('../controller/dto/room.dto.d.ts').QuestionDto} QuestionDto */

/**
 * @param {number} quizId
 * @param {PlayerEntity} gameMaster
 * @returns {Promise<RoomResponseDto>}
 */
export async function create(quizId, gameMaster) {
    return createRoom(quizId, gameMaster)
}

/**
 * @param {string} roomId
 * @returns {Promise<RoomEntity>}
 */
export async function getRoom(roomId) {
    const room = await findRoomById(roomId)
    if (!room) throw new NotFoundError(`Room ${roomId} introuvable`)
    return room
}

/**
 * @param {string} roomId
 * @returns {Promise<GameStepDto>}
 */
export async function startGame(roomId) {
    const room = await findRoomById(roomId)
    if (!room) throw new NotFoundError(`Room ${roomId} introuvable`)
    if (room.status !== 'WAITING') throw new BadRequestError('La room a déjà démarré')

    const res = await fetch(`${QUIZ_SERVICE}/quizz/${room.quizId}/questions`)
    if (!res.ok) throw new BadRequestError(`Impossible de charger les questions : ${res.statusText}`)

    const questions = await res.json()
    if (!questions.length) throw new BadRequestError('Aucune question trouvée pour ce quiz')

    await Promise.all([
        valkey.set(`room:${roomId}:questions`, JSON.stringify(questions)),
        valkey.hset(`room:${roomId}:currentQuestion`, {
            data: JSON.stringify(questions[0]),
            index: 0
        }),
        valkey.set(`room:${roomId}:timer`, questions[0].timeLimit ?? 30),
        updateStatus(roomId, 'PLAYING')
    ]);

    const q = questions[0];

    /** @type {QuestionDto} */
    const currentQuestion = {
        id: q.id,
        title: q.title,
        options: q.options,
        timeLimit: q.timeLimit
    };

    return {room: roomId, finished: false, currentQuestion: currentQuestion}
}

/**
 * @param {string} roomId
 * @returns {Promise<GameStepDto>}
 */
export async function nextQuestion(roomId) {
    const questions = JSON.parse(await valkey.get(`room:${roomId}:questions`))
    if (!questions) throw new NotFoundError(`Aucune question en cours pour la room ${roomId}`)

    let index = parseInt(await valkey.hget(`room:${roomId}:currentQuestion`, 'index'))

    if (index >= questions.length - 1) {
        await endGame(roomId)
        return { room: roomId, finished: true }
    }

    index += 1
    const next = questions[index]

    await Promise.all([
        valkey.hset(`room:${roomId}:currentQuestion`, {
            data: JSON.stringify(next),
            index: index
        }),
        valkey.del(`room:${roomId}:buzzer`),
        valkey.set(`room:${roomId}:timer`, next.timeLimit ?? 30)
    ])

    /** @type {QuestionDto} */
    const currentQuestion = {
        id: next.id,
        title: next.title,
        options: next.options,
        timeLimit: next.timeLimit
    };

    return { room: roomId, finished: false, currentQuestion: currentQuestion }
}

/**
 * @param {string} roomId
 * @returns {Promise<{ room: string, status: string }>}
 */
export async function endGame(roomId) {
    await Promise.all([
        valkey.del(`room:${roomId}:questions`),
        valkey.del(`room:${roomId}:currentQuestion`),
        valkey.del(`room:${roomId}:timer`),
        valkey.del(`room:${roomId}:buzzer`),
        updateStatus(roomId, 'FINISHED'),
    ])

    publish('quiz.ended', {roomId})

    return {room: roomId, status: 'FINISHED'}
}