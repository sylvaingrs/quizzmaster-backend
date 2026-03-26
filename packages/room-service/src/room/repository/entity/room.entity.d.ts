import {RoomStatus} from "../../../types/enums";
import { PlayerRole } from '../../../types/enums'

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
    players?: PlayerEntity[]
    checkpoints?: CheckpointEntity[]
}

export interface CheckpointEntity {
    roomId: string
    questionId: number
    quizId: number
    scores: Record<string, number>
}