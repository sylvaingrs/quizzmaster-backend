import { prisma } from "@quizzmaster-backend/prisma";
import crypto from 'crypto'
 
/** 
 * @typedef {import('./entity/room.entity.d.ts').RoomEntity} RoomEntity 
 * @typedef {import('./entity/room.entity.d.ts').PlayerEntity} PlayerEntity
*/

function generateRoomCode() {
    return crypto.createHash('md5').update(Date.now().toString() + Math.random().toString()).digest('hex').substring(0, 6).toUpperCase()
}

/**
 * @param {number} quizId
 * @param {string} pseudo
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity>}
 */
export async function createRoom(quizId, pseudo){
    let roomId = generateRoomCode()

    let existing = await prisma.room.findUnique({ where: { id: roomId } })

    while (existing) {
        roomId = generateRoomCode()
        existing = await prisma.room.findUnique({ where: { id: roomId } })
    }

    return prisma.room.create({
        data: {
            id: roomId,
            quizId,
            players: {
                create: {
                    name: pseudo,
                    role: 'GAMEMASTER'
                }
            }
        },
        include: {
            players: true,
            checkpoints: true
        },
        omit: {
            createdAt: true,
            updatedAt: true
        }
    });
}

/**
 * @param {string} roomId
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity | null>}
 */
export async function findRoomById(roomId){
    return prisma.room.findUnique({
        where: {
            id: roomId
        },
        include: { players: true, checkpoints: true},
        omit: {
            createdAt: true,
            updatedAt: true
        }
    });
}

/**
 * @param {string} roomId
 * @param {string} pseudo
 * @param {'PLAYER' | 'SPECTATOR'} role
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity | null>}
 */
export async function joinRoomRepository(roomId, pseudo, role) {
    await prisma.player.create({
        data: {
            roomId,
            name: pseudo,
            role
        }
    })

    return findRoomById(roomId)
}

/**
 * @param {string} roomId
 * @param {import('../../types/enums.d.ts').RoomStatus} status
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity>}
 */
export async function updateStatus(roomId, status){
    return prisma.room.update({
        where: {
            id: roomId
        },
        data: {
            status
        }
    });
}