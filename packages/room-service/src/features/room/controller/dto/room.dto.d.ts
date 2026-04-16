import {PlayerEntity} from "../../repository/entity/room.entity";
import {RoomStatus} from "../../../types/enums";


export interface CreateRoomDto {
    quizId: number
}

export interface RoomResponseDto {
    id: string
    quizId: number
    status: RoomStatus
    players: PlayerEntity[]
}

export interface QuestionDto {
    id: number
    title: string
    options: string[]
    timeLimit: number
}

export interface GameStepDto {
    room: string
    finished: boolean
    currentQuestion?: QuestionDto
}