import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { App, Module, applicationUrl } from '@blockframes/utils/apps';

@Pipe({ name: 'goToApp', pure: true })
export class GoToAppPipe implements PipeTransform {
  transform(app: App, module: Module, type?: string, id?: string, suffix?: string) {
    let path = '';
    switch (type) {
      case 'title':
        if (module === 'dashboard') {
          path = `/tunnel/movie/${id}/main`;
        } else {
          path = `/title/${id}/main`;
        }
        break;
      case 'contract':
        path = `/tunnel/contract/${id}/${suffix}`;
        break;
      case 'event':
        path = `/event/${id}/`;
        break;
      default:
        path = type ? `/${type}` : '';
        break;
    }

    return `${applicationUrl[app]}/c/o/${module}${path}`;
  }
}

@NgModule({
  declarations: [GoToAppPipe],
  exports: [GoToAppPipe]
})
export class GoToAppModule { }