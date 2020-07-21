import { Component, Input, Directive, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../+state/movie.model';
import { Title } from '../../+state/movie.firestore';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[movie] movie-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

  public poster: HostedMedia;
  public title: Title;
  public director: string;
  public countries: string[];
  public date: number;

  @Input() set movie(movie: Movie) {
    if (movie) {
      this.poster = movie.main.poster.media;
      this.title = movie.main.title;
      this.director = movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
      this.countries = movie.main.originCountries;
      this.date = movie.main.productionYear;
    }
  }
}


@Directive({
  selector: 'movie-banner-actions, [movieBannerActions]',
  host: {
    class: '.movie-banner-actions'
  }
})
export class BannerActionsDirective { }
