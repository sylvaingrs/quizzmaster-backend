import {app} from "./config/fastify.js"

import {roomRoutes} from "./features/room/controller/room.controller.js"
import {buzzerRoutes} from "./features/buzzer/controller/buzzer.controller.js";
import {leaderboardRoutes} from "./features/leaderboard/controller/leaderboard.controller.js";
import {checkpointRoutes} from "./features/checkpoint/controller/checkpoint.controller.js";

await app.register(roomRoutes);

await app.register(buzzerRoutes, {prefix: '/buzzer'})
await app.register(leaderboardRoutes, {prefix: '/leaderboard'})
await app.register(checkpointRoutes, {prefix: '/checkpoint'})

await app.listen({port: 3002, host: '0.0.0.0'});