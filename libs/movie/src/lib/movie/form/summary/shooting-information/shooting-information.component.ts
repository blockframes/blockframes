import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss']
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
    const shootingFrom = this.shootingPlanned.get('from');
    const shootingTo = this.shootingPlanned.get('to');

    const noFrom = !!shootingFrom.get('period').value || !!shootingFrom.get('month').value || !!shootingFrom.get('year').value;
    const noTo = !!shootingTo.get('period').value || !!shootingTo.get('month').value || !!shootingTo.get('year').value;

    return noFrom || noTo;
  }
}
