// Angular
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';

// Blockframes
import { AlgoliaMovie, AlgoliaOrganization, AlgoliaRecord, AlgoliaService } from '@blockframes/utils/algolia';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface CarouselSection {
  title: string;
  movies: Promise<AlgoliaRecord<AlgoliaMovie>>;
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
  public orgs: Promise<AlgoliaRecord<AlgoliaOrganization>>;

  constructor(
    private algoliaService: AlgoliaService,
    private dynTitle: DynamicTitleService,
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.sections = [
      {
        title: 'New on Media Financiers',
        movies: this.algoliaService.query('movie', { activePage: 0, limitResultsTo: 50, facets: { storeConfig: 'accepted' } }),
        size: 'poster'
      }
      // CMS will add more
    ];
    this.orgs = this.algoliaService.query('org', { activePage: 0, limitResultsTo: 50, facets: { isAccepted: true, hasAcceptedMovies: true } })
  }
}
