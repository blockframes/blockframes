import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-no-movie',
  templateUrl: './no-movie.component.html',
  styleUrls: ['./no-movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoMovieComponent {
  constructor(private intercom: Intercom) {}

  public openIntercom(): void {
    return this.intercom.show();
  }
}
