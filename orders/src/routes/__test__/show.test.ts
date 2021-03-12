import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app'
import { Ticket } from '../../models/ticket';

it('it fetchees the order', async() => {
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

  //make request to fetch the order
  const { body: fetchedOrder } = await request(app)
  .get(`/api/orders/${orderId}`)
  .set('Cookie', user)
  .send()
  .expect(200);  

  expect(fetchedOrder.id).toEqual(order.id);
});

it('it returns an error if one user tries to fetche another users order', async() => {
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
  .get(`/api/orders/${orderId}`)
  .set('Cookie', global.signin())
  .send()
  .expect(401);  

});