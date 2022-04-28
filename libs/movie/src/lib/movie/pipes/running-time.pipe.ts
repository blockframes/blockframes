import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime, screeningStatus } from '@blockframes/model';

/**
 * Format the running time to show 'time min' and the status if needed
 * @param runningTime Object runningTime
 * @param isStatusNeeded For some component, like movie-card, we don't want the status at all
 */
export function formatRunningTime(runningTime?: MovieRunningTime, isStatusNeeded: boolean = true) {
  const { time, status } = runningTime;

  if (isStatusNeeded) {
    if (status === 'tobedetermined' || (!time && status)) return screeningStatus[status];
    if (time && status && status !=="confirmed") return `${time} min (${screeningStatus[runningTime.status]})`;
    if (time && !status) return `${time} min`;
  }

  if (time) return status === "estimated" ? `≈ ${time} min` : `${time} min`;
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
