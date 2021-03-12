import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, NotAuthorizedError, BadRequestError} from '@kdhamricorg/common';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', 
  requireAuth, [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title cannot be empty'),
    body('price')
      .isFloat({ gt: 0})
      .withMessage('Price must be provded and must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  } 

  if (req.currentUser!.id !== ticket.userId) {
    throw new NotAuthorizedError();
  }

  //order id being there means the ticket is locked to an order - no editing for 15 minutes
  if (ticket.orderId) {
    throw new BadRequestError('Cannot edit a reserved ticket');
  }

  ticket.set({
    title: req.body.title,
    price: req.body.price
  })

  await ticket.save();

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    version: ticket.version,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  });


  res.send(ticket);

  
}); 

export { router as updateTicketRouter };