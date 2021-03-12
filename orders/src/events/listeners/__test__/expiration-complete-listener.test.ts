import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@kdhamricorg/common';



const setup = async() => {
  // creates an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //need a ticket 
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save();

  //need an order defined that is tied to the ticket
  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket
  })
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // create a fake message object
  
  //ignoring because we do not want to have to identify all the functions
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { ticket, order, listener, data, msg}

};

it('it updates the order status to cancel', async() => {
  const {  ticket, order, listener, data, msg } = await setup();
  
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an OrderCancelled event', async() => {
  const {  ticket, order, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);


  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);

});

it('it acks the message', async() => {
  const {  ticket, order, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});