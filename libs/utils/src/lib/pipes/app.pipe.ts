import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { getAppName, App } from '../apps';

@Pipe({ name: 'appName' })
export class AppNamePipe implements PipeTransform {
  transform(app: App, short = false): string {
    return getAppName(app, short).label;
  }
}

@NgModule({
  exports: [AppNamePipe],
  declarations: [AppNamePipe]
})
export class AppPipeModule { }