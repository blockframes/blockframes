import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime, formatRunningTime } from '@blockframes/model';

@Pipe({
  name: 'getRunningTime',
  pure: true
})
export class RunningTimePipe implements PipeTransform {
  transform(runningTime: MovieRunningTime, isStatusNeeded = true) {
    return formatRunningTime(runningTime, isStatusNeeded);
  }
}

@NgModule({
  declarations: [RunningTimePipe],
  exports: [RunningTimePipe]
})
export class RunningTimePipeModule { }
