import { prisma } from "@quizzmaster-backend/prisma";
import {NotFoundError} from "../../errors.js";

/** 
 * @typedef {import('./entity/room.entity.d.ts').RoomEntity} RoomEntity 
 * @typedef {import('./entity/room.entity.d.ts').PlayerEntity} PlayerEntity
*/


/**
 * @param {number} quizId
 * @param {PlayerEntity} gameMaster
 * @returns {Promise<RoomEntity>}
 */
export async function createRoom(quizId, gameMaster){
    return prisma.room.create({
        data: {
            quizId,
            players: { create: [gameMaster] }
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
 * @returns {Promise<RoomEntity | null>}
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
 * @returns {Promise<RoomEntity>}
 */
export async function updateStatus(roomId, status) {
    try {
        return await prisma.room.update({
            where: { id: roomId },
            data: { status }
        });
    } catch (e) {
        if (e.code === 'P2025') {
            throw new NotFoundError(`Impossible de mettre à jour : Room ${roomId} introuvable`);
        }
        throw e;
    }
}