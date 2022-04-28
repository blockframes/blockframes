import { Inject, NgModule, Pipe, PipeTransform } from '@angular/core';
import { hasAppStatus, Movie, StoreStatus, App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Pipe({ name: 'hasAppStatus' })
export class HasAppStatusPipe implements PipeTransform {
  constructor(@Inject(APP) public app: App) { }

  transform(titles: Movie[], status: StoreStatus) {
    return titles.some(hasAppStatus(this.app, [status]))
  }
}

@NgModule({
  exports: [HasAppStatusPipe],
  declarations: [HasAppStatusPipe],
})
export class HasAppStatusModule { }
