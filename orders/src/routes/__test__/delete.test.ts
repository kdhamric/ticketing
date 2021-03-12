import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app'
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('it successfully deletes the order', async() => {
  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  //make a request to build an order with this ticket

  const user = global.signin();


  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({ ticketId: ticket.id })
  .expect(201)

  const orderId = order.id;

  //make request to delete the order
  await request(app)
  .delete(`/api/orders/${orderId}`)
  .set('Cookie', user)
  .send()
  .expect(204);  

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('it returns an error if one user tries to delete another users order', async() => {
  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  //make a request to build an order with this ticket
  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', global.signin())
  .send({ ticketId: ticket.id })
  .expect(201)

  const orderId = order.id;

  //make request to fetch the order
  const { body: fetchedOrder } = await request(app)
  .del(`/api/orders/${orderId}`)
  .set('Cookie', global.signin())
  .send()
  .expect(401);  

});

it('cancels an order and publishes an event ', async() => {

  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  //make a request to build an order with this ticket

  const user = global.signin();


  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({ ticketId: ticket.id })
  .expect(201)

  const orderId = order.id;

  //make request to delete the order
  await request(app)
  .delete(`/api/orders/${orderId}`)
  .set('Cookie', user)
  .send()
  .expect(204);  


  expect(natsWrapper.client.publish).toHaveBeenCalled();
})