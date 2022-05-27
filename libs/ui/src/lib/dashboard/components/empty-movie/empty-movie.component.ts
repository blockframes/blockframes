// Angular
import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'dashboard-empty-movie',
  templateUrl: './empty-movie.component.html',
  styleUrls: ['./empty-movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyMovieComponent {
  @Input() appName: string;

  constructor(
    @Optional() private intercom: Intercom,
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
