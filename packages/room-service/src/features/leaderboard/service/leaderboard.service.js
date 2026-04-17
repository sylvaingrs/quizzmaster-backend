import {getLeaderboard} from "../repository/leaderboard.repository.js";
import {valkey} from "@quizzmaster-backend/valkey-service/client.js";

export async function fetchLeaderboard(roomId) {
    const leaderboard = await getLeaderboard(roomId);

    const playerMap = await valkey.hgetall(`room:${roomId}:players`) || {};

    const players = {};
    for (const [id, value] of Object.entries(playerMap)) {
        try {
            players[id] = JSON.parse(value);
        } catch {
            players[id] = { name: value, role: 'PLAYER' };
        }
    }

    const scores = [];
    const addedUserIds = new Set();

    for (let i = 0; i < leaderboard.length; i += 2) {
        const userId = leaderboard[i];
        addedUserIds.add(userId);
        const name = players[userId] ? players[userId].name : userId;
        scores.push({
            userId: name,
            score: Number(leaderboard[i+1])
        });
    }

    for (const [userId, playerData] of Object.entries(players)) {
        if (!addedUserIds.has(userId) && playerData.role === 'PLAYER') {
            scores.push({
                userId: playerData.name,
                score: 0
            });
        }
    }

    return {
        roomId: roomId,
        leaderboard: scores
    };
}