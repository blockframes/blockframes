import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { createMovieFestivalPrizes, MovieFestivalPrizes } from '../../+state';

@Component({
  selector: '[festivalprizes] movie-display-festivalprizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayFestivalPrizesComponent {

  public data : MovieFestivalPrizes;
  @Input() set festivalprizes(festivalprizes: Partial<MovieFestivalPrizes>) {
    this.data = createMovieFestivalPrizes(festivalprizes);
  }

}
