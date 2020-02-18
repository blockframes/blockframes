import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent {
  @HostBinding('attr.page-id') pageId = 'display-card';
  @Input() movie: Movie;
  @Input() link: string;

  public get posterSrc() {
    return this.movie.promotionalElements.poster[0].media || '/assets/images/default-movie-poster.png';
  }

  public get firstFestivalPrizeLogo() {
    const { prizes } = this.movie.festivalPrizes;
    const hasPrizeUrl = !!(prizes.length && prizes[0].logo.url);
    return hasPrizeUrl ? prizes[0].logo : '';
  }
}
