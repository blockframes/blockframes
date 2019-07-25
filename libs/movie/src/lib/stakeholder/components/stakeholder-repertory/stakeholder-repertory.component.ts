import { algolia } from '@env';
import { FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import algoliasearch from 'algoliasearch/lite';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { Organization, OrganizationService } from '@blockframes/organization';
import { StakeholderService } from '../../+state';
import {
  InstantSearchConfig,
  SearchClient
} from 'angular-instantsearch/instantsearch/instantsearch';

// @ts-ignore
const searchClient: SearchClient = algoliasearch(algolia.appId, algolia.searchKey);

interface AlgoliaOrganizationHit {
  objectID: string;
  name: string;
}

@Component({
  selector: 'stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent implements OnInit, OnDestroy {
  public stakeholderForm = new FormControl();
  public organizations: Organization[];
  private config: InstantSearchConfig = {
    indexName: algolia.indexNameOrganizations,
    searchClient
  };
  private destroyed$ = new Subject();

  constructor(
    private service: StakeholderService,
    private movieQuery: MovieQuery,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {}

  public submit(hit: AlgoliaOrganizationHit) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    this.service.addStakeholder(this.movieQuery.getActive(), { id: hit.objectID });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
