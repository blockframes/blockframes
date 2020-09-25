import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryShootingInformationComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  get shootingDates() {
    return this.movie.shooting.get('dates');
  }

  get shootingPlanned() {
    return this.movie.shooting.get('dates').get('planned');
  }

  get shootingLocations() {
    return this.movie.shooting.get('locations');
  }

  isThereShootingPlanned() {
    const exists = (key) => {
      const { period, month, year } = this.shootingPlanned.get(key).value;
      return period || month || year;
    }
    return exists('from') || exists('to');
  }
}
