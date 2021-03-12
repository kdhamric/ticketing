import { Message} from 'node-nats-streaming';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@kdhamricorg/common';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { id, orderId, stripeId } = data;

    //find the order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found when receiving payment created error');
    }

    //change the status to paid
    order.status = OrderStatus.Complete;

    await order.save();

    msg.ack();
  }
}