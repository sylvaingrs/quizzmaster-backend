import { JsonValue } from "@quizzmaster-backend/prisma/src/generated/prisma/runtime/client";

export interface CheckpointEntity {
    id: string
    roomId: string
    questionId: number
    quizId: number
    scores: Record<string, number> | JsonValue
    createdAt?: Date
    updatedAt?: Date
}
