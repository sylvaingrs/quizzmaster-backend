import { createClient } from "./client.js";
import {createLogger} from "@quizzmaster-backend/logger";

const logger = createLogger('valkey-publisher')
const pub = createClient()

pub.on('error', (err) => {
    logger.error({ err: err.message }, '[Publisher] Erreur connexion Valkey')
})

export const publish = (channel, payload) => {
    pub.publish(channel, JSON.stringify(payload))
}