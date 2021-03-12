import { Mongoose } from 'mongoose';
import request from 'supertest';
import { isTaggedTemplateExpression } from 'typescript';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

import { natsWrapper } from '../../nats-wrapper';

//jest.mock('../../nats-wrapper');

it('returns a 404 if the provided id does not exist', async () => {

  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'aslkd',
      price: 20
    })
    .expect(404);

});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'aslkd',
      price: 20
    })
    .expect(401); 
});



it('returns a 401 if the user does not own the ticket', async () => {


  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 20
    })


    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'concert new',
      price: 1000
    })
    .expect(401)

});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const signinCookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinCookie)
    .send({
      title: 'concert',
      price: 20
    })

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: '',
    price: 1000
  })
  .expect(400)
  
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: 'Concert 2',
    price: -10
  })
  .expect(400)

});

it('updates the ticket provided valid inputs', async () => {
  const signinCookie = global.signin();

  //create ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinCookie)
    .send({
      title: 'concert',
      price: 20
    })

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: 'concert 2',
    price: 22
  })
  .expect(200)  

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)


  expect(ticketResponse.body.title).toEqual('concert 2');
  expect(ticketResponse.body.price).toEqual(22);

});

it('creates a ticket and publishes an event ', async() => {
  const signinCookie = global.signin();

  //create ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinCookie)
    .send({
      title: 'concert',
      price: 20
    })

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: 'concert 2',
    price: 22
  })
  .expect(200)  

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)


  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

 
it('returns an error if the user attempts to edit a locked/reserved ticket', async () => {
  const signinCookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinCookie)
    .send({
      title: 'concert',
      price: 20
    })

  //need to set the ticket as reserved
  const ticket = await Ticket.findById(response.body.id);


  ticket!.set({  orderId: 'dsdsd' });
  await ticket!.save();

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: 'new title',
    price: 1000
  })
  .expect(400)
  
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', signinCookie)
  .send({
    title: 'Concert 2',
    price: -10
  })
  .expect(400)

});