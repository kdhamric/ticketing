import { Publisher, ExpirationCompleteEvent, Subjects } from '@kdhamricorg/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>  {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
