import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects } from '@kdhamricorg/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';
import { OrderStatus } from '@kdhamricorg/common';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

  
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    
    const { id, version  } = data;

  
    
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    if (!order) {
      msg.ack();
      throw new Error('Cannot find id of this order that a cancellation is being attempted on');
    }
    

    order.status = OrderStatus.Cancelled;

    await order.save();

    msg.ack();


  }
}