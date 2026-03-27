import crypto from 'crypto'
import { prisma } from '@quizzmaster-backend/prisma'

/** @typedef {import('./entity/user.entity.js').RoomEntity} RoomEntity */

function generateRoomCode() {
    return crypto.createHash('md5').update(Date.now().toString() + Math.random().toString()).digest('hex').substring(0, 6).toUpperCase()
}

/**
 * @param {number} quizId
 * @param {string} pseudo
 * @returns {Promise<{ room: RoomEntity, roomId: string }>} 
 */
export async function createRoom(quizId, pseudo) {
    let roomId = generateRoomCode()
    let existing = await prisma.room.findUnique({ where: { id: roomId } })

    while (existing) {
        roomId = generateRoomCode()
        existing = await prisma.room.findUnique({ where: { id: roomId } })
    }

    const room = await prisma.room.create({
        data: {
            id: roomId,
            quizId,
            status: 'WAITING',
            players: {
                create: {
                    name: pseudo,
                    role: 'GAMEMASTER'
                }
            }
        },
        include: { players: true }
    })

    return { room, roomId: room.id }
}

/**
 * @param {string} roomId
 * @returns {Promise<RoomEntity | null>}
 */
export async function findRoomById(roomId) {
    return prisma.room.findUnique({
        where: { id: roomId },
        include: { players: true },
        omit: {
            createdAt: true,
            updatedAt: true
        }
    })
}

/**
 * @param {string} roomId
 * @param {string} pseudo
 * @param {'PLAYER' | 'SPECTATOR'} role
 * @returns {Promise<{ roomId: string, pseudo: string, role: 'PLAYER' | 'SPECTATOR' }>} 
 */
export async function joinRoom(roomId, pseudo, role) {
    const player = await prisma.player.create({
        data: {
            roomId,
            name: pseudo,
            role
        }
    })

    return {
        roomId,
        pseudo: player.name,
        role: player.role
    }
}