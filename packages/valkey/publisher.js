import { createClient } from "./client.js";

const pub = createClient()

export const publish = (channel, payload) => {
    pub.publish(channel, JSON.stringify(payload))
}