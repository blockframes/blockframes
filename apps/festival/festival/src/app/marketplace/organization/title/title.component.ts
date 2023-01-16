import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AlgoliaService } from '@blockframes/utils/algolia';
import { AuthService } from '@blockframes/auth/service';
import { AnalyticsService } from '@blockframes/analytics/service';

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  public isAnonymous: boolean;

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService,
    private algoliaService: AlgoliaService,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap((org) => this.algoliaService.query('movie', {
        activePage: 0,
        limitResultsTo: 1000,
        facets: { storeStatus: 'accepted', orgNames: [org.name] }
      })),
      switchMap(({ hits }) => this.service.valueChanges(hits.map(h => h.objectID))),
      map(movies => movies.filter(m => m.app.festival.status === 'accepted')),
      map(movies => movies.filter(m => m.app.festival.access === true)),
      map(movies => movies.sort((a, b) => a._meta.createdAt < b._meta.createdAt ? 1 : -1)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
    this.isAnonymous = await this.authService.isSignedInAnonymously();

    const org = await firstValueFrom(this.parent.org$);
    this.analyticsService.addOrganizationPageView(org);
  }
}
