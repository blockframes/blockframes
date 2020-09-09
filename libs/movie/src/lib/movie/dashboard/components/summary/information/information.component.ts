import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryInformationComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  public get genres() {
    return [this.movie.get('genres'), ...this.movie.get('customGenres').controls];
  }
}
