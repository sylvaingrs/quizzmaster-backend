import {createRoom, findRoomById, updateStatus} from "./room.repository.js";
import {QUIZ_SERVICE} from "../config/services.js";
import {valkey} from "../../../valkey/client.js"
import {publish} from "../../../valkey/publisher.js";

/** @typedef {import('./types/room.entity').RoomEntity} RoomEntity */
/** @typedef {import('./types/room.dto').RoomResponseDto} RoomResponseDto */
/** @typedef {import('./types/room.dto').GameStepDto} GameStepDto */

/**
 * @param {number} quizId
 * @returns {Promise<RoomResponseDto>}
 */
export async function create(quizId) {
    return createRoom(quizId)
}

/**
 * @param {string} roomId
 * @returns {Promise<RoomResponseDto>}
 */
export async function getRoom(roomId) {
    return findRoomById(roomId);
}

/**
 * @param {string} roomId
 * @returns {Promise<GameStepDto>}
 */
export async function startGame(roomId) {
    const room = await findRoomById(roomId)
    if (!room) {
        const error = new Error("Room not found");
        error.status = 404;
        throw error;
    }
    if (room.status !== "WAITING") {
        const error = new Error("Room already started");
        error.status = 400;
        throw error;
    }

    // const res = await fetch(`${QUIZ_SERVICE}/quiz/${room.quizId}/questions`);
    //
    // if (!res.ok) {
    //     const error = new Error(`Failed to fetch quiz questions: ${res.statusText}`);
    //     error.status = res.status;
    //     throw error;
    // }
    //
    // const questions = await res.json();

    const questions = [
        {
            id: 1,
            title: "Quelle est la capitale de la France ?",
            options: ["Lyon", "Paris", "Marseille"],
            correctAnswer: ["Paris"],
            timeLimit: 15
        },
        {
            id: 2,
            title: "Combien font 2 + 2 ?",
            options: ["3", "4", "5"],
            correctAnswer: ["4"],
            timeLimit: 10
        }
    ];

    await valkey.set(`room:${roomId}:questions`, JSON.stringify(questions));
    await valkey.hset(`room:${roomId}:currentQuestion`, {
        data: JSON.stringify(questions[0]),
        index: 0
    });
    await valkey.set(`room:${roomId}:timer`, questions[0].timeLimit ?? 30);

    await updateStatus(roomId, "PLAYING");

    const {correctAnswer, ...questionWithoutAnswer} = questions[0];

    return {
        room: roomId,
        finished: false,
        currentQuestion: questionWithoutAnswer
    };
}

export async function nextQuestion(roomId) {
    const questions = JSON.parse(await valkey.get(`room:${roomId}:questions`))
    let index = parseInt(await valkey.hget(`room:${roomId}:currentQuestion`, "index"))

    if (index >= questions.length - 1) {
        await updateStatus(roomId, "FINISHED");
        return {finished: true}
    }

    index += 1;

    const nextQuestion = questions[index];

    await valkey.hset(`room:${roomId}:currentQuestion`, {
        data: JSON.stringify(nextQuestion),
        index: index
    });
    await valkey.del(`room:${roomId}:buzzer`)
    await valkey.set(`room:${roomId}:timer`, nextQuestion.timeLimit ?? 30);

    return {finished: false, room: roomId, currentQuestion: nextQuestion}
}

/**
 * @param {string} roomId
 * @returns {Promise<{room: string, status: string}>}
 */
export async function endGame(roomId) {
    await valkey.del(`room:${roomId}:questions`)
    await valkey.del(`room:${roomId}:currentQuestion`)
    await valkey.del(`room:${roomId}:timer`)
    await updateStatus(roomId, "FINISHED");

    await publish("quiz.ended", {roomId});

    return {room: roomId, status: "FINISHED"}
}