import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { Organization } from '@blockframes/organization';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { IndexForOrganizations, OrganizationAlgoliaResult } from '@blockframes/utils';
import { Index } from 'algoliasearch';

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

  constructor(@Inject(IndexForOrganizations) private organizationIndex: Index) {
  }

  ngOnInit() {
    this.subscription = this.searchOnChange();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  submit(organizationResult: OrganizationAlgoliaResult) {
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
        this.organizationIndex.search(stakeholderName, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }

          this.organizationsSearchResults = result.hits;
        });
      });
  }
}
