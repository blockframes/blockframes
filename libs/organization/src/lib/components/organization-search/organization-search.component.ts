import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output
} from '@angular/core';
import { Organization } from '@blockframes/organization';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OrganizationAlgoliaResult, OrganizationsIndex } from '@blockframes/utils';
import { Index } from 'algoliasearch';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'organization-search',
  templateUrl: './organization-search.component.html',
  styleUrls: ['./organization-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSearchComponent implements OnInit {
  @Output() picked = new EventEmitter<OrganizationAlgoliaResult>();
  public organizationForm = new FormControl();
  public searchResults$: Observable<OrganizationAlgoliaResult[]>;

  constructor(@Inject(OrganizationsIndex) private organizationIndex: Index) {}

  ngOnInit() {
    this.searchResults$ = this.organizationForm.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(denomination => {
        return new Promise<OrganizationAlgoliaResult[]>((res, rej) => {
          this.organizationIndex.search(denomination.full, (err, result) => (err ? rej(err) : res(result.hits)));
        });
      })
    );
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.denomination.full : undefined;
  }

  public submit(event: MatAutocompleteSelectedEvent) {
    const result: OrganizationAlgoliaResult = event.option.value;
    this.picked.emit(result);
    this.organizationForm.reset();
  }
}
