// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieForm, MoviePrizeForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFestivalPrizesComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  public festivalPrizeHasNoValue(festivalPrize: MoviePrizeForm) {
    return !festivalPrize.get('name').value && !festivalPrize.get('prize').value && !festivalPrize.get('year').value && !festivalPrize.get('premiere').value;
  }
}
