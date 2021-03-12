import { Publisher, OrderCreatedEvent, Subjects } from '@kdhamricorg/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}