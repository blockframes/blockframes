import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import algoliasearch from 'algoliasearch/lite';
import { algolia } from '@env';
import { Organization } from '@blockframes/organization';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { StakeholderService } from '../../+state';

// @ts-ignore
const searchClient: SearchClient = algoliasearch(algolia.appId, algolia.searchKey);
const index = searchClient.initIndex(algolia.indexNameOrganizations);

/** An Organization search result coming from Algolia */
interface OrganizationAlgoliaResult {
  name: string;
  objectID: string;
}

@Component({
  selector: 'stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent implements OnInit, OnDestroy {
  public stakeholderForm = new FormControl();
  public organizationsSearchResults: OrganizationAlgoliaResult[];
  private subscription: Subscription;

  constructor(private service: StakeholderService, private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.subscription = this.searchOnChange();
  }

  public submit(hit: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    this.service.addStakeholder(this.movieQuery.getActive(), { id: hit.objectID });
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private searchOnChange() {
    return this.stakeholderForm.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((stakeholderName: string) => {
        index.search(stakeholderName, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }

          this.organizationsSearchResults = result.hits;
        });
      });
  }
}
