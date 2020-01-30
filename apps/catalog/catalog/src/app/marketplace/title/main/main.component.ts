import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';

@Component({
  selector: 'catalog-movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieMainComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-main';
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  constructor(private movieQuery: MovieQuery,) { }

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPrize(prize) {
    return [prize.name, prize.prize, prize.year, prize.premiere].join(' | ');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: string) {
    const array = movie.main.stakeholders[role];
    return array.map(e => {
      if(e.countries && e.countries.length > 0) {
        return `${e.displayName} (${e.countries})`;
      }
      return e.displayName;
    })
  }

  public getSalesCast(movie: Movie, role: string) {
    return movie.salesCast[role].map(e => {
      if(e.role && e.role.length > 0) {
        return `${e.firstName} ${e.lastName} (${e.role})`;
      }
      return `${e.firstName} ${e.lastName}`;
    });
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

}
