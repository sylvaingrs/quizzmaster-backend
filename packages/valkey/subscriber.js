import { createClient } from "./client.js";
import {createLogger} from "@quizzmaster-backend/logger";

const logger = createLogger('valkey-pubsub')
const sub = createClient()

sub.on('error', (err) => {
    logger.error({ err: err.message }, '[PubSub] Erreur connexion Valkey')
})

sub.on('connect', () => {
    logger.info('[PubSub] Connecté à Valkey')
})

sub.on('reconnecting', () => {
    logger.warn('[PubSub] Reconnexion en cours...')
})

export const subscribe = (channel, handler) => {
    sub.subscribe(channel, (err) => {
        if (err) {
            logger.error({ err: err.message, channel }, '[PubSub] Erreur subscribe')
            throw err
        }
    })

    sub.on('message', (chan, message) => {
        if (chan === channel) {
            try {
                handler(JSON.parse(message))
            } catch (err) {
                logger.error({ err: err.message, channel }, '[PubSub] Erreur parsing message')
            }
        }
    })
}