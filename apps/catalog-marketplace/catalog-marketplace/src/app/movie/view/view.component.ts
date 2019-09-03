import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public movieId: string;

  constructor(private query: MovieQuery) {}

  ngOnInit() {
    this.getMovie();
  }

  private async getMovie() {
    this.loading$ = this.query.selectLoading();
    this.movieId = this.query.getActiveId();
    this.movie$ = this.query.selectActive();
  }

  get internationalPremiere() {
    const name = this.query.getActive().main.title.original;
    const year = this.query.getActive().main.productionYear;
    return name !== '' ? `${name}, ${year}` : null;
  }

  get color() {
    const color = this.query.getActive().salesInfo.color;
    return color === 'c' ? 'color' : 'black & white';
  }

  get europeanQualification() {
    const europeanQualification = this.query.getActive().salesInfo.europeanQualification;
    return europeanQualification ? 'Yes' : 'No';
  }
}
