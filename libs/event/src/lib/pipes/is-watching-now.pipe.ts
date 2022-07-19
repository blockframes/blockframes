import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { differenceInSeconds } from 'date-fns';

function isWatchingNow(date?: Date) {
  if (!date) return false;
  const now = new Date();
  const diff = differenceInSeconds(now, date);
  return diff <= 120;
}

@Pipe({ name: 'isWatchingNow' })
export class IsWatchingNowPipe implements PipeTransform {

  transform(date: Date) {
    return isWatchingNow(date);
  }
}

@NgModule({
  declarations: [IsWatchingNowPipe],
  exports: [IsWatchingNowPipe]
})
export class IsWatchingNowPipeModule { }
