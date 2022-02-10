import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public org$ = this.orgService.currentOrg$;
  public loading$: Observable<boolean>;
  private sub: Subscription;

  navLinks: RouteDescription[] = [
    {
      path: 'activity',
      label: 'Marketplace'
    },
    {
      path: 'main',
      label: 'Main'
    },
    {
      path: 'artistic',
      label: 'Artistic'
    },
    {
      path: 'production',
      label: 'Production'
    },
    {
      path: 'additional',
      label: 'Additional',
    },
    {
      path: 'delivery',
      label: 'Available Materials',
    },
  ];

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private orgService: OrganizationService
  ) {
    const titleName = this.movieQuery.getActive().title.international || 'No title'
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
