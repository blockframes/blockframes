import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Pipe({
  name: 'app'
})
export class AppPipe implements PipeTransform {
  constructor(private routerQuery: RouterQuery) { }
  transform(app: string): boolean {
    return this.routerQuery.getData('app') === app;
  }
}

@NgModule({
  exports: [AppPipe],
  declarations: [AppPipe]
})
export class AppPipeModule { }