import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../+state';
import { EventService } from '../+state/event.service';

@Pipe({ name: 'getEvent' })
export class GetEventPipe implements PipeTransform {

  constructor(
    private service: EventService
  ) { }

  transform(titleId: string): Observable<Event>
  transform(titleId: string[]): Observable<Event[]>
  transform(titleId: string | string[]) {
    // We need that for the compiler to be happy, else it doesn't understand params
    return Array.isArray(titleId)
      ? this.service.valueChanges(titleId)
      : this.service.valueChanges(titleId);
  }
}

@NgModule({
  declarations: [GetEventPipe],
  exports: [GetEventPipe]
})
export class GetEventPipeModule { }
