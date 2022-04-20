import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { App, appName, appShortName } from '../apps';

@Pipe({ name: 'appName' })
export class AppNamePipe implements PipeTransform {
  transform(app: App, mode: 'short' | 'long' = 'long'): string {
    return mode === 'short' ? appShortName[app] : appName[app];
  }
}

@NgModule({
  exports: [AppNamePipe],
  declarations: [AppNamePipe]
})
export class AppPipeModule { }