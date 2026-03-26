import {PlayerRole} from "@quizzmaster-backend/tools/types";

export interface CreateRoomDto {
    pseudo: string
    quizId: number
}

export interface JoinRoomDto {
    pseudo: string
}

export interface RoomActionResponseDto {
    roomId: string
    pseudo: string
    role: PlayerRole
}