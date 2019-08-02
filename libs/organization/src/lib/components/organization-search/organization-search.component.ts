import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Organization } from '@blockframes/organization';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import algoliasearch from 'algoliasearch/lite';
import { algolia } from '@env';

// @ts-ignore
const searchClient: SearchClient = algoliasearch(algolia.appId, algolia.searchKey);
const index = searchClient.initIndex(algolia.indexNameOrganizations);

/** An Organization search result coming from Algolia */
export interface OrganizationAlgoliaResult {
  name: string;
  objectID: string;
}

@Component({
  selector: 'organization-search',
  templateUrl: './organization-search.component.html',
  styleUrls: ['./organization-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSearchComponent implements OnInit, OnDestroy {
  @Output() picked = new EventEmitter<OrganizationAlgoliaResult>();
  public organizationsSearchResults: OrganizationAlgoliaResult[];
  public organizationForm = new FormControl();
  private subscription: Subscription;

  constructor() {}

  ngOnInit() {
    this.subscription = this.searchOnChange();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  submit(organizationResult: any) {
    this.picked.emit(organizationResult);
    this.organizationForm.reset();
  }

  private searchOnChange() {
    return this.organizationForm.valueChanges
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
