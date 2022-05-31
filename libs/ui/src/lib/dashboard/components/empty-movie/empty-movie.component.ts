// Angular
import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'dashboard-empty-movie',
  templateUrl: './empty-movie.component.html',
  styleUrls: ['./empty-movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyMovieComponent {

  constructor(
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
