import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '../../main/main.form';

@Component({
  selector: '[main] movie-summary-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryInformationComponent {
  @Input() main: MovieMainForm;

  public get genres() {
    return this.main.genres.controls.concat(this.main.customGenres.controls);
  }

  public get totalRunTime() {
    return this.main.get('totalRunTime');
  }
}
