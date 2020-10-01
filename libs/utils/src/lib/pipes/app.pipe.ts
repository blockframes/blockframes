import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getAppName, App } from '../apps';

@Pipe({ name: 'app' })
export class AppPipe implements PipeTransform {
  constructor(private routerQuery: RouterQuery) { }
  transform(app: string): boolean {
    return this.routerQuery.getData('app') === app;
  }
}
@Pipe({ name: 'appName' })
export class AppNamePipe implements PipeTransform {
  transform(app: App): string {
    return getAppName(app).label;
  }
}

@NgModule({
  exports: [AppPipe, AppNamePipe],
  declarations: [AppPipe, AppNamePipe]
})
export class AppPipeModule { }