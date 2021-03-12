import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects } from '@kdhamricorg/common';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';



export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find the ticket
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw an error
    if (!ticket) {
      throw new Error('Could not find ticket with this id');
    }

    // mark the ticket as being reserved by update it with the order id
    ticket.set({ orderId: undefined })
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    msg.ack();
  }
}