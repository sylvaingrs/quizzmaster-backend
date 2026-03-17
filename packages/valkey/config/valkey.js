import Redis from 'ioredis'

export const valkey = new Redis({
    host: 'localhost',
    port: 6379
});

export async function updateScore(roomId, userId) {
    await valkey.zincrby(`leaderboard:${roomId}`, 1, userId)
}

export async function getScores(roomId) {
    const raw = await valkey.zrevrange(`leaderboard:${roomId}`, 0, -1, 'WITHSCORES')

    const leaderboard = []
    for (let i = 0; i < raw.length; i += 2) {
        leaderboard.push({
            userId: raw[i],
            score: parseInt(raw[i + 1])
        })
    }

    return leaderboard
}

export async function setCurrentQuestion(roomId, questionId) {
    await valkey.set(`room:${roomId}:currentQuestion`, questionId)
}

export async function getCurrentQuestion(roomId) {
    return valkey.get(`room:${roomId}:currentQuestion`);
}
