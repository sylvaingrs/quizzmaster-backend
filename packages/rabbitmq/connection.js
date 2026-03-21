let connection;
let channel;

export const getChannel = async () => {
    if (channel) return channel;

    connection = await amqp.connect(
        process.env.RABBITMQ_URL ?? "amqp://localhost",
    )

    channel = await connection.createChannel();

    return channel;
}
