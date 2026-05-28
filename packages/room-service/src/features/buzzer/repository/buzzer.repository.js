import {valkey} from "@quizzmaster-backend/valkey-service/client.js";

export async function tryBuzz(roomId, userId){
    const result = await valkey.setnx(`room:${roomId}:buzzer`, userId);
    return result === 1;
}

export async function getBuzzer(roomId){
    return valkey.get(`room:${roomId}:buzzer`)
}

export async function resetBuzzer(roomId){
    return valkey.del(`room:${roomId}:buzzer`)
}

export async function getCurrentQuestion(roomId) {
    const data = await valkey.hgetall(`room:${roomId}:currentQuestion`)
    if (!data) return null
    return data
}