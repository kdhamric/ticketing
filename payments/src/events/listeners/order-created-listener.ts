import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@kdhamricorg/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

  
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('Got it ken')
    //const { id, version, ticket, userId, status  } = data;

    //const price = ticket.price;

    //const order = Order.build({
    //  id, version, price, userId, status
    //})


    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    
    await order.save();

    msg.ack();

  }
}