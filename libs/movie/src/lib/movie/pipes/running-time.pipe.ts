import { Pipe, PipeTransform, NgModule } from '@angular/core';


@Pipe({
  name: 'getRunningTime',
  pure: true
})
export class RunningTimePipe implements PipeTransform {
  transform(value: string | number): string {
    return (typeof value === 'number') ? `${value}min` : 'TBC';
  }
}

@NgModule({
  declarations: [RunningTimePipe],
  exports: [RunningTimePipe]
})
export class RunningTimePipeModule { }
