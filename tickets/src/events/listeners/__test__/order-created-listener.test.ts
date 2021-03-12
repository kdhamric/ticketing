import {OrderCreatedEvent, OrderStatus } from '@kdhamricorg/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';


const setup = async() => {
  // creates an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save();


  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'dffsdfds',
    ticket: {
      id: ticket.id,
      price: ticket.price
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

it('make sure the ticket is marked with the order id', async() => {
  
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage funtion with the data object + message object
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id)


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
  expect(ticketUpdatedData.orderId).toEqual(data.id);


});