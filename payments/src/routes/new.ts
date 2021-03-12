import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { stripe } from '../stripe';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from  '../nats-wrapper';

import { 
  OrderStatus,
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError
} from '@kdhamricorg/common';
import { Order } from '../models/orders';


const router = express.Router();

router.post('/api/payments',
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty(),
    body('orderId')
      .not()
      .isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { token, orderId } = req.body;

    //find the order the user is trying to pay for 
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new NotFoundError();
    }
    
    // make sure the order belongs to this user
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    if ( order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }
    
    const amountInCents = Math.round(order.price * 100);

    console.log('yes it is processing!!');

    // pass token to stripe to get information about the payment
    const stripeCharge = await stripe.charges.create({
      currency: 'usd',
      amount: amountInCents,
      source: token
    });

    // make  sure the payment amount matches the amount due for the order
    
    // verify payment with Stripe api
    
    
    // create payment record to record successful payment
    const payment = Payment.build({
      orderId,
      stripeId: stripeCharge.id
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id });
  }
);



export { router as createChargeRouter };