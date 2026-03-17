import amqplib from 'amqplib';

async function receiveMessage() {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'hello';
        
        await channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log("[x] Received:", msg.content.toString());
                channel.ack(msg);
            }
        });
    }
    catch (error) {
    console.error(error);
    process.exit(1);
  }
}

receiveMessage();
    