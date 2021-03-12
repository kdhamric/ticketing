import { Publisher, OrderCancelledEvent, Subjects } from '@kdhamricorg/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}