import {OrderCancelledEvent, OrderStatus } from '@kdhamricorg/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';


const setup = async() => {
  // creates an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  // create a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  });

  ticket.set({orderId});
  await ticket.save();


  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    version: 0,
    id: orderId,
    ticket: {
      id: ticket.id,
    }
  }

  // create a fake message object
  
  //ignoring because we do not want to have to identify all the functions
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg}

};

it('make sure the tickets order id is cleared', async() => {
  
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(undefined)


})

it('acks the message', async() => {
    
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called!
  expect(msg.ack).toHaveBeenCalled();

})

it('publishes a ticket updated event', async() => {

  const { listener, ticket, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called!
  expect(natsWrapper.client.publish).toHaveBeenCalled();


  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(ticketUpdatedData.orderId).toEqual(undefined);


});