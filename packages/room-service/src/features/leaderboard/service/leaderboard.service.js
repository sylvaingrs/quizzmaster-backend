import {getLeaderboard} from "../repository/leaderboard.repository.js";

/** @typedef {import('../controller/dto/leaderboard.dto.d.ts').LeaderboardDto} LeaderboardDto */
/** @typedef {import('../controller/dto/leaderboard.dto.d.ts').LeaderboardResponseDto} LeaderboardResponseDto */

export async function fetchLeaderboard(roomId) {
    /** @type {string[]} */
    const leaderboard = await getLeaderboard(roomId);

    /** @type {LeaderboardDto[]} */
    const scores = [];

    for (let i = 0; i < leaderboard.length; i += 2) {
        scores.push({
            userId: leaderboard[i],
            score: Number(leaderboard[i+1])
        });
    }

    return {
        roomId: roomId,
        leaderboard: scores
    };
}