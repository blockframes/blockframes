import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { App, appName, appShortName } from '../apps';

@Pipe({ name: 'appName' })
export class AppNamePipe implements PipeTransform {
  transform(app: App, short = false): string {
    return short ? appShortName[app] : appName[app];
  }
}

@NgModule({
  exports: [AppNamePipe],
  declarations: [AppNamePipe]
})
export class AppPipeModule { }