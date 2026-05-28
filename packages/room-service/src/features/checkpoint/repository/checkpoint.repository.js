import { prisma } from "@quizzmaster-backend/prisma";

/**
 * @returns {Promise<import('./types/room.entity.d.ts').RoomEntity[]>}
 */
export async function findPlayingRooms() {
    return prisma.room.findMany({
        where: {
            status: 'PLAYING'
        }
    });
}