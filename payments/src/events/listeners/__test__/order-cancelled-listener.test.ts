import { OrderCancelledEvent, OrderStatus } from '@kdhamricorg/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';



const setup = async() => {
  // creates an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: orderId,
    version: 0,
    price: 33,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await order.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    version: 1,
    id: orderId,
    ticket: {
      id: 'sdfsdfsdfd'
    }
  }

  // create a fake message object
  
  //ignoring because we do not want to have to identify all the functions
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, order}

};

it('insures the order is cancelled when cancel message is received', async() => {
  
  const { listener, data, msg, order } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder).toBeDefined();
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

})

it('acks the message', async() => {
    
  const { listener, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called!
  expect(msg.ack).toHaveBeenCalled();

})