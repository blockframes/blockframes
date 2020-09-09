// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Form
import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCountryComponent {
  @Input() movie: MovieForm;
  @Input() link: string;
}
