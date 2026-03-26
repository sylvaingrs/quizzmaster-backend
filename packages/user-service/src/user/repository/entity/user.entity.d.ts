import {RoomStatus, PlayerRole} from "@quizzmaster-backend/tools/types";

export interface PlayerEntity {
    id: string
    roomId: string
    name: string
    role: PlayerRole
}

export interface RoomEntity {
    id: string
    quizId: number
    status: RoomStatus
    players: PlayerEntity[]
}
