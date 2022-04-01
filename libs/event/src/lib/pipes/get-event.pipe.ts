import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '@blockframes/shared/model';
import { EventService } from '../+state/event.service';

@Pipe({ name: 'getEvent' })
export class GetEventPipe implements PipeTransform {
  constructor(private service: EventService) {}

  transform(eventId: string): Observable<Event>;
  transform(eventId: string[]): Observable<Event[]>;
  transform(eventId: string | string[]) {
    // We need that for the compiler to be happy, else it doesn't understand params
    return Array.isArray(eventId) ? this.service.valueChanges(eventId) : this.service.valueChanges(eventId);
  }
}

@NgModule({
  declarations: [GetEventPipe],
  exports: [GetEventPipe],
})
export class GetEventPipeModule {}
