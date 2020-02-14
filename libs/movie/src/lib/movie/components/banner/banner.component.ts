import { Component, Input, Directive, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../+state';
import { Title } from '../../+state/movie.firestore';
import { ImgRef } from '@blockframes/utils';

@Component({
  selector: '[movie] movie-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

  public poster: ImgRef;
  public title: Title;
  public director: string;
  public countries: string;
  public date: number;

  @Input() set movie(movie: Movie) {
    console.log(movie);
    this.poster = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
    this.title = movie.main.title;
    this.director = movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
    this.countries = movie.main.originCountries.join(', ');
    this.date = movie.main.productionYear;
  }
}


@Directive({
  selector: 'movie-banner-actions, [movieBannerActions]',
  host: {
    class: '.movie-banner-actions'
  }
})
export class BannerActionsDirective {}