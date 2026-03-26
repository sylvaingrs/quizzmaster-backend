import { prisma } from "@quizzmaster-backend/prisma";

/**
 * @param {number} quizId
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity>}
 */
export async function createRoom(quizId){
    return prisma.room.create({
        data: {
            quizId,
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