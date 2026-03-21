import { createClient } from "./client.js";

const sub = createClient()

export const subscribe = (channel, handler) => {
    sub.subscribe(channel, (err) => {
        if (err) {
            throw err;
        }
    })

    sub.on("message", (chan, message) => {
        if (chan === channel) {
            handler(JSON.parse(message))
        }
    })
}