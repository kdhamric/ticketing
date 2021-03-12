import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';


export class TicketCreatedListener extends Listener<TicketCreatedEvent> {

  //different way of doing 'readonly'...  subject: Subjects.TicketCreated  = Subjects.TicketCreated;
  readonly subject: Subjects.TicketCreated  = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: any, msg: Message) {
    console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    console.log(data.title);
    console.log(data.price);
    msg.ack();
  }
}