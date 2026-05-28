import {RoomStatus} from "../../../types/enums";
import { PlayerRole } from '../../../types/enums'
import { JsonValue } from "@quizzmaster-backend/prisma/src/generated/prisma/runtime/client";
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
    checkpoints: CheckpointEntity[]
}

export interface CheckpointEntity {
    roomId: string
    questionId: number
    quizId: number
    // Prisma renvoie un JsonValue pour le champ JSON, donc on accepte l’union
    scores: Record<string, number> | JsonValue
    createdAt?: Date
    updatedAt?: Date
}