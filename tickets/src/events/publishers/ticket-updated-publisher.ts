import { Publisher, Subjects, TicketUpdatedEvent } from '@kdhamricorg/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}