export interface AnswerDto {
    userId: string
    answer: string
}

export interface BuzzResponseDto {
    success: boolean
    userId: string
}

export interface AnswerResponseDto {
    correct: boolean
    userId: string
}