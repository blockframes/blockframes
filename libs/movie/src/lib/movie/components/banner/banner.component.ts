import { Component, OnInit, Input, Directive } from '@angular/core';
import { Movie } from '../../+state';
import { Title } from '../../+state/movie.firestore';
import { ImgRef } from '@blockframes/utils';

@Component({
  selector: 'movie-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

  public poster: ImgRef;
  public title: Title;
  public director: string;
  public countries: string;
  public date: number;

  @Input() set movie(movie: Movie) {
    this.poster = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
    this.title = movie.main.title;
    this.director = movie.main.directors[0] && movie.main.directors[0].displayName;
    this.countries = movie.main.originCountries.join(', ');
    this.date = movie.main.productionYear;
  }

  constructor() { }

  ngOnInit() {
  }

}


@Directive({
  selector: 'movie-banner-actions, [movieBannerActions]',
  host: {
    class: '.movie-banner-actions'
  }
})
export class BannerActionsDirective {}