import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';


import { app } from './app';
import { OrderStatus } from '@kdhamricorg/common';


const start = async () => {
  console.log('starting...')

  if (! process.env.JWT_KEY) {
    throw new Error('JWT_KEY env var must be defined.')
  }

  if (! process.env.MONGO_URI) {
    throw new Error('MONGO_URI env var must be defined.')
  }

  if (! process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID env var must be defined.')
  }

  if (! process.env.NATS_URL) {
    throw new Error('NATS_URL env var must be defined.')
  }

  if (! process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID env var must be defined.')
  }
//
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );

    //clean up code if NATS connection goes away
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect( process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to mongodb')
  } catch (err) {
    console.log(err);
  }


}



const port = 3000;
app.listen(port, () => {
  console.log('Listening on Port ', port)
});

start();


