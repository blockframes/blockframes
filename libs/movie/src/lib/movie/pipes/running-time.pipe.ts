import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieRunningTime, screeningStatus } from '@blockframes/model';

/**
 * Format the running time to show 'time min' and the status if needed
 * @param runningTime Object runningTime
 * @param isStatusNeeded For some component, like movie-card, we don't want the status at all
 */
export function formatRunningTime(runningTime?: MovieRunningTime, isStatusNeeded: boolean = true) {
  const { time, status, episodeCount } = runningTime;

  const timeString = episodeCount ? `${episodeCount} x ${time} min` : `${time} min`;

  if (isStatusNeeded) {
    if (status === 'tobedetermined' || (!time && status)) return screeningStatus[status];
    if (time && status && status !== 'confirmed') return `${timeString} (${screeningStatus[runningTime.status]})`;
    if (time && !status) return timeString;
  }

  if (time) return status === 'estimated' ? `≈ ${timeString}` : timeString;
}

@Pipe({
  name: 'getRunningTime',
  pure: true
})
export class RunningTimePipe implements PipeTransform {
  transform(runningTime: MovieRunningTime, isStatusNeeded: boolean = true) {
    return formatRunningTime(runningTime, isStatusNeeded);
  }
}

@NgModule({
  declarations: [RunningTimePipe],
  exports: [RunningTimePipe]
})
export class RunningTimePipeModule { }
