import amqplib from 'amqplib';

async function sendMessage() {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'hello';
    const msg = 'Hello world';

    await channel.assertQueue(queue, {
      durable: false
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
    
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

sendMessage();
