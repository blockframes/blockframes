// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { MovieService, Movie } from '@blockframes/movie/+state';
import { OrganizationService, Organization } from '@blockframes/organization/+state';

// RxJs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// env
import { centralOrgID } from '@env';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { QueryFn } from '@angular/fire/firestore';

interface CarouselSection {
  title: string;
  movies$: Observable<Movie[]>;
  queryParams?: Record<string, string>;
  size: 'banner' | 'poster'
}

@Component({
  selector: 'financiers-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  public sections: CarouselSection[];
  public orgs$: Observable<Organization[]>;

  public featuredOrg$: Observable<Organization>;

  constructor(
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    
    const queryFn: QueryFn = ref => ref.where('storeConfig.appAccess.financiers', '==', true).where('storeConfig.status', '==', 'accepted');
    this.sections = [
      {
        title: 'New projects',
        movies$: this.movieService.valueChanges(ref => queryFn(ref).orderBy('_meta.createdAt', 'desc')),
        size: 'banner'
      },
      {
        title: 'Recommanded for you',
        movies$: this.movieService.valueChanges(ref => queryFn(ref)),
        size: 'poster'
      },
      {
        title: 'In development',
        movies$: this.movieService.valueChanges(ref => queryFn(ref).where('productionStatus', '==', 'development')),
        queryParams: { productionStatus: 'development' },
        size: 'banner'
      }
    ];

    this.orgs$ = this.organizationService
      .valueChanges(ref => ref
        .where('appAccess.financiers.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && org.movieIds.length)));

    this.featuredOrg$ = this.orgs$.pipe(
      map(orgs => orgs.filter(org => org.movieIds.length > 3)),
      map(orgs => orgs[Math.floor(Math.random() * orgs.length)])
    );

  }
}
