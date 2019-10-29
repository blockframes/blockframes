import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, HostBinding } from '@angular/core';

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

  get posterSrc() {
    return this.movie.main.poster || '/assets/images/default-movie-poster.png';
  }
}
