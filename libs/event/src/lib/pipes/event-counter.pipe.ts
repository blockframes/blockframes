import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '@blockframes/model';

@Pipe({name: 'eventCounter'})
export class EventCounterPipe implements PipeTransform {
  transform(event: Event) {

    const milliseconds = event.start.getTime() - Date.now();
    const msInDays = 1000 * 60 * 60 * 24;
    const msInHours = 1000 * 60 * 60;
    const msInMins = 1000 * 60;

    const days = Math.trunc(milliseconds / msInDays);
    const hours = Math.trunc((milliseconds - (days*msInDays)) / msInHours);
    const mins = Math.trunc((milliseconds - (hours*msInHours) - (days*msInDays)) / msInMins);

    return `${days} days | ${hours} hours | ${mins} minutes`;
  }
}

@NgModule({
  declarations: [EventCounterPipe],
  exports: [EventCounterPipe],
})
export class EventCounterModule {}
