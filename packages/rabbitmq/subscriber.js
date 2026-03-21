import { getChannel } from "./connection.js";

export const subscribe = async (queue, handler) => {
    const channel = await getChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, (msg) => {
        if (!msg) return;
        handler(JSON.parse(msg.content.toString()));
        channel.ack(msg);
    });
};