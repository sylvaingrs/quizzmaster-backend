import {valkey} from "../../../../../valkey/client.js";

export async function getLeaderboard(roomId){
    return valkey.zrevrange(`leaderboard:${roomId}`, 0, -1, 'WITHSCORES')
}