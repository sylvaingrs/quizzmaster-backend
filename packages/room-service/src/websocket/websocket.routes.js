import {subscribe} from "@quizzmaster-backend/valkey-service/subscriber.js";

/** @type {Map<String, Set<WebSocket>>} */
const rooms = new Map()

export async function websocketRoutes(app) {
    app.get('/:id/ws', {websocket: true}, (socket, req) => {
        const roomId = req.params.id
        const name = `room:${roomId}`;

        if (!rooms.has(name)) {
            rooms.set(name, new Set())
        }

        rooms.get(name).add(socket)

        socket.on('close', () => {
            rooms.get(name)?.delete(socket)
            if (rooms.get(name)?.size === 0) rooms.delete(name)
        })
    })
}

function broadcastToRoom(roomId, payload) {
    const clients = rooms.get(`room:${roomId}`)
    if (!clients?.size) return

    const message = JSON.stringify(payload)
    for (const client of clients) {
        if (client.readyState === 1) client.send(message)
    }
}

export async function startPubSub() {
    subscribe('buzzer.taken', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'buzzer.taken', userId: payload.userId })
    })

    subscribe('scores.updated', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'scores.updated', leaderboard: payload.leaderboard })
    })

    subscribe('buzzer.reset', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'buzzer.reset' })
    })

    subscribe('answer.result', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'answer.result', userId: payload.userId, correct: payload.correct, expected: payload.expected })
    })

    subscribe('question.changed', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'question.changed', currentQuestion: payload.currentQuestion})
    })

    subscribe('game.started', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'game.started', currentQuestion: payload.currentQuestion })
    })

    subscribe('game.ended', (payload) => {
        broadcastToRoom(payload.roomId, { event: 'game.ended', leaderboard: payload.leaderboard })
    })
}