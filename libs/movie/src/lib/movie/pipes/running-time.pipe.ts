import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime } from '../+state/movie.firestore';
import { screeningStatus } from '@blockframes/utils/static-model/static-model';

/**
 * Format the running time to show 'time min' and the status if needed
 * @param runningTime Object runningTime
 * @param isStatusNeeded For some component, like movie-card, we don't want the status in parenthesis
 */
export function formatRunningTime(runningTime?: MovieRunningTime, isStatusNeeded: boolean = true) {
  const { time, status } = runningTime;

  if (isStatusNeeded) {
    // if time and status
    if (time && status) {

      if (typeof time === 'number') return `${time} min (${screeningStatus[runningTime.status]})`;
    }

    // if only time
    else if (time && !status) {
      if(typeof time === 'number') return `${time} min`;
    }

    // if only status
    else if (!time && status) return screeningStatus[status];
  }

  else {
     if (time && status) {
      if(typeof time === 'number') {
        if (status === "estimated") return `≈ ${time} min`;
        else return `${time} min`;
      }
    }
  }

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
