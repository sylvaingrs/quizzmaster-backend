export interface LeaderboardDto {
    userId: string
    score: number
}

export interface LeaderboardResponseDto {
    roomId: string
    leaderboard: LeaderboardDto[]
}