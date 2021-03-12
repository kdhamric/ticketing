import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

//jest.mock('../../nats-wrapper');

it('returns a 404 if the ticket is not found', async() => {

  const id = new mongoose.Types.ObjectId().toHexString();

  const ticketResponse = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);

    
})

it('returns the ticket if the ticket is found', async() => {
  const title = 'concert';
  const price = 20

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: price
    })
    .expect(201)

    const ticketId = response.body.id;

    const ticketResponse = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send()
    .expect(200)

    
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);

    
})