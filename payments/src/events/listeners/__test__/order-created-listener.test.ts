import { OrderCreatedEvent, OrderStatus } from '@kdhamricorg/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';



const setup = async() => {
  // creates an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toString(),
    ticket: {
      price: 10,
      id: 'sdfsdfsdfd'
    }
  }

  // create a fake message object
  
  //ignoring because we do not want to have to identify all the functions
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg}

};

it('creates and saves an order in the pricing instance of mongo', async() => {
  
  const { listener, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
 await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.ticket.price);
  expect(order!.version).toEqual(data.version);

})

it('acks the message', async() => {
    
  const { listener, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called!
  expect(msg.ack).toHaveBeenCalled();

})