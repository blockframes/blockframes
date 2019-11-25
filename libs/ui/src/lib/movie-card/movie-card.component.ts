import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { App } from '@blockframes/utils';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent {
  @HostBinding('attr.page-id') pageId = 'display-card';
  @Input() movie: Movie;
  @Input() app: string;

  public get posterSrc() {
    return this.movie.main.poster || '/assets/images/default-movie-poster.png';
  }

  public get firstFestivalPrizeLogo() {
    if(this.movie.festivalPrizes.prizes.length && this.movie.festivalPrizes.prizes[0].logo) {
      return this.movie.festivalPrizes.prizes[0].logo;
    } else {
      return '';
    }
  }

  /** Redirect depending of the app using movie-card. */
  public get appLink() {
    if (this.app === App.mediaDelivering) {
      return `/layout/o/${this.app}/movie/${this.movie.id}`;
    }
    if (this.app === App.biggerBoat) {
      return `/layout/o/${this.app}/${this.movie.id}`;
    }
  }
}
