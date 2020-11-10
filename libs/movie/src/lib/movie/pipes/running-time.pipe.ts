import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime } from '../+state/movie.firestore';


export function formatRunningTime(runningTime?: MovieRunningTime) {
  if(runningTime.time) {
    if(typeof runningTime.time === 'number') {
      return `${runningTime.time} min`;
    } else return;
  } else return;
}

@Pipe({
  name: 'getRunningTime',
  pure: true
})
export class RunningTimePipe implements PipeTransform {
  transform(runningTime: MovieRunningTime) {
    return formatRunningTime(runningTime);
  }
}

@NgModule({
  declarations: [RunningTimePipe],
  exports: [RunningTimePipe]
})
export class RunningTimePipeModule { }
