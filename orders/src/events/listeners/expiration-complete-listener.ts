import { Message} from 'node-nats-streaming';
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus } from '@kdhamricorg/common';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
//import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found when trying to expire');
    }

    if ( order.status === OrderStatus.Complete) {
      return msg.ack();
    }



    //update the order's status to cancelled
    order.set({
      status:  OrderStatus.Cancelled
    })
    await order.save();

    //publish an event saying this was cancelled
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });


    msg.ack();
  }
}