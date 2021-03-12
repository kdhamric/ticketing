import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/orders';
import { Payment } from '../../models/payments';
import mongoose from 'mongoose';
import { stripe } from '../../stripe';

//was used with mocking approach...  jest.mock('../../stripe');

import { natsWrapper } from '../../nats-wrapper';
import { FileWatcherEventKind } from 'typescript';


it('has a route handler listening to /api/payments for post requests', async () => {
  const response = await request(app)
    .post('/api/payments')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/payments')
    .send({});

  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid orderId is provided', async () => {
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: 'fdfdsfsdffs'});

  expect(400);
});

it('returns an error if an invalid token is provided', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ orderId: 'dfdsffsdf'})
  .expect(400);

});



it('returns a not found error (404) if a matching order does not exist', async () => {

  
  //send a payment post for a non existing order
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ 
      orderId: new mongoose.Types.ObjectId().toHexString(),
    token: 'sffdsdffdsdsd' })
    .expect(404);


});


it('returns a 401 when purchasing an order that does not belong to a user', async() => {
  //create an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20.50,
    status: OrderStatus.AwaitingPayment,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 2,
  });

  await order.save();

  //send a payment post for this order with a different user id
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin())
  .send({ 
    orderId: order.id,
    token: 'sffdsdffdsdsd' })
  .expect(401);

})


it('returns a 400 when purchasing a cancelled order ', async() => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  //create a cancelled order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20.50,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 2,
  });

  await order.save();

  //send a payment post for this order from the proper user but for a cancelled order and get a 400
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({ 
    orderId: order.id,
    token: 'sffdsdffdsdsd' })
  .expect(400); 
})

it('returns a 201 when purchasing a valid order', async() => {

  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  //create a cancelled order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    userId: userId,
    version: 2,
  });

  await order.save();

  //send a payment post for this order from the proper user but for a cancelled order and get a 400
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({ 
    orderId: order.id,
    token: 'tok_visa' })
  .expect(201); 

  //expects used when mocking stripe
  //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  //expect(chargeOptions.source).toEqual('tok_visa');
  //expect(chargeOptions.amount).toEqual(20*100);
  //expect(chargeOptions.currency).toEqual('usd');

  //reach out to stripe and get information about the 10 most recent charges that have been created
  
  const stripeCharges = await stripe.charges.list({limit: 50});
  //console.log(stripeCharges)
  // nake sure the last charges contain the charge we just made 
  const foundCharge = stripeCharges.data.find((charge) => {
    return (charge.amount === price * 100)
  })

  //make sure we got at least one row in the array back
  expect(foundCharge).toBeDefined();
  expect(foundCharge!.currency).toEqual('usd');


})


it('returns saves payment information when a valid order is purchased', async() => {

  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const orderId = new mongoose.Types.ObjectId().toHexString();

  //create a cancelled order
  const order = Order.build({
    id: orderId,
    price: price,
    status: OrderStatus.Created,
    userId: userId,
    version: 2,
  });

  await order.save();

  //send a payment post for this order from the proper user but for a cancelled order and get a 400
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({ 
    orderId: order.id,
    token: 'tok_visa' })
  .expect(201); 


  const payment = await Payment.findOne({
    orderId
  });

  //reach out to stripe and get information about the 10 most recent charges that have been created
  
  const stripeCharges = await stripe.charges.list({limit: 50});
  //console.log(stripeCharges)
  // nake sure the last charges contain the charge we just made 
  const foundCharge = stripeCharges.data.find((charge) => {
    return (charge.amount === price * 100)
  })

  //make sure we got at least one row in the array back
  expect(payment).toBeDefined();
  const stripeId = payment!.stripeId;

  expect(stripeId).toEqual(foundCharge!.id);


})