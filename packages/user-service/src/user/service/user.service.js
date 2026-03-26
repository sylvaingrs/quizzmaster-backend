import {ROOM_SERVICE} from "../../config/services.js"
import {BadRequestError, NotFoundError} from "@quizzmaster-backend/tools/errors"
import {createRoom as createRoomRepository, findRoomById, joinRoom as joinRoomRepository} from "../repository/user.repository.js"

/** @typedef {import('../repository/entity/user.entity.js').RoomEntity} RoomEntity */

/**
 * @param {number} quizId
 * @param {string} pseudo
 * @returns {Promise<{ roomId: string, pseudo: string, role: string }>}
 */
export async function createRoom(quizId, pseudo) {
    const { roomId, room } = await createRoomRepository(quizId, pseudo)
    return {
        roomId,
        pseudo,
        role: room.players[0]?.role ?? 'GAMEMASTER'
    }
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
 * @param {string} pseudo
 * @returns {Promise<{ roomId: string, pseudo: string, role: string }>}
 */
export async function joinRoom(roomId, pseudo) {
    const room = await findRoomById(roomId)
    if (!room) throw new NotFoundError(`Room ${roomId} introuvable`)

    const role = room.status === 'WAITING' ? 'PLAYER' : 'SPECTATOR'
    return joinRoomRepository(roomId, pseudo, role)
}

/**
 * @param {unknown} data
 * @returns {Promise<{ status: string }>}
 */
export async function forwardGatewayUser(data) {
    const result = await fetch(`${ROOM_SERVICE}/user-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })

    if (!result.ok) {
        throw new BadRequestError('Failed to forward data to room service')
    }

    await result.json()
    return { status: 'OK' }
}