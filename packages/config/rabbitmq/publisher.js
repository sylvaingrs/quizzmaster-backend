import { getChannel } from "./connection.js";

export const publish = async (queue, payload) => {
    const channel = await getChannel()

    await channel.assertQueue(queue, { durable: true })
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))
}