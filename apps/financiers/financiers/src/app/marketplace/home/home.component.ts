// Angular
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { createStorageFile } from '@blockframes/model';

// Blockframes
import { AlgoliaMovie, AlgoliaOrganization, AlgoliaService, SearchResponse } from '@blockframes/utils/algolia';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface CarouselSection {
  title: string;
  movies: Promise<SearchResponse<AlgoliaMovie>>;
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

  @HostBinding('test-id="content"') testId

  public sections: CarouselSection[];
  public orgs: Promise<SearchResponse<AlgoliaOrganization>>;

  public benefits = [
    {
      title: 'Tag along with professional content financiers',
      imgAsset: 'tag_along.svg',
      description: 'Co-invest with professional funds and benefit from « pari passu » financial conditions, already optimized thanks to their expertise. '
    },
    {
      title: 'Get access to prominent film companies and projects',
      imgAsset: 'topfilms.svg',
      description: 'Find the hottest projects selected by a pool of industry veterans and benefit from their knowledge of the industry.'
    },
    {
      title: 'Learn about investing in the content industry',
      imgAsset: 'knowledge.svg',
      description: 'No experience needed. \n Discover why content is a profitable investment.',
      link: {
        href: 'assets/docs/film-industry.pdf',
        text: 'Download our investment guide.'
      }
    },
    {
      title: 'Enjoy exclusive privileges',
      imgAsset: 'exclusive_priviledges.svg',
      description: 'Get perks and live the full experience \n of the content industry.'
    }
  ];


  constructor(
    private algoliaService: AlgoliaService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.sections = [
      {
        title: 'New on Media Financiers',
        movies: this.algoliaService.query('movie', { activePage: 0, limitResultsTo: 50, facets: { storeStatus: 'accepted' } }),
        size: 'poster'
      }
      // CMS will add more
    ];
    this.orgs = this.algoliaService.query('org', { activePage: 0, limitResultsTo: 50, facets: { isAccepted: true, hasAcceptedMovies: true } })
      .then(result => {
        for (const org of result.hits) {
          org.logo = createStorageFile({
            storagePath: org.logo,
            collection: 'orgs',
            docId: org.objectID,
            field: 'logo',
            privacy: 'public'
          }) as any;
        }
        return result
      })
  }
}
