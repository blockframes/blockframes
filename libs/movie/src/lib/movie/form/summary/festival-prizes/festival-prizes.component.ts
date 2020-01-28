import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieFestivalPrizesForm } from '@blockframes/movie/movieform/festival-prizes/festival-prizes.form';

@Component({
  selector: '[festivalPrizes] movie-summary-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFestivalPrizesComponent {
  @Input() festivalPrizes: MovieFestivalPrizesForm;
  @Input() link: string;
}
