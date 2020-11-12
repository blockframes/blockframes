import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime } from '../+state/movie.firestore';
import { screeningStatus } from '@blockframes/utils/static-model/static-model';

/**
 * Format the running time to show 'time min' and the status if needed
 * @param runningTime Object runningTime
 * @param isStatusNeeded For some component, like movie-card, we don't want the status in parenthesis
 */
export function formatRunningTime(runningTime?: MovieRunningTime, isStatusNeeded: boolean = true) {
  if (isStatusNeeded) {
    // if time and status
    if (runningTime.time && runningTime.status) {
      const status = screeningStatus[runningTime.status];

      if (typeof runningTime.time === 'number') {
        return `${runningTime.time} min (${status})`;
      }
      else return;
    }

    // if only time
    else if (runningTime.time && !runningTime.status) {
      if(typeof runningTime.time === 'number') {
        return `${runningTime.time} min`;
      }
      else return;
    }

    // if only status
    else if (!runningTime.time && runningTime.status) {
      const status = screeningStatus[runningTime.status];
      return status;
    }

    // if no time and no status
    else return
  }

  else {
     if (runningTime.time && runningTime.status) {
      if(typeof runningTime.time === 'number') {
        if (runningTime.status === "estimated") {
          return `≈ ${runningTime.time} min`;
        }
        else return `${runningTime.time} min`;
      }
      else return;
    }

    // if no time and no status
    else return
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
