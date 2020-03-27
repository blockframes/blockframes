import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { DynamicTitleService } from '@blockframes/utils';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;
  private sub: Subscription;

  navLinks = [
    {
      path: 'activity',
      label: 'Marketplace Activity'
    },
    {
      path: 'details',
      label: 'Film Details'
    }
  ];

  constructor(private movieQuery: MovieQuery, private dynTitle: DynamicTitleService, private router: Router) {
    const titleName = this.movieQuery.getActive().main.title.international || 'No title'
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        event.url.includes('details')
          ? this.dynTitle.setPageTitle(`${titleName}`, 'Film Details')
          : this.dynTitle.setPageTitle(`${titleName}`, 'Marketplace Activity')
      }
    })
  }

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPoster(movie: Movie) {
    return movie.promotionalElements.poster.length && movie.promotionalElements.poster[0].media;
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
