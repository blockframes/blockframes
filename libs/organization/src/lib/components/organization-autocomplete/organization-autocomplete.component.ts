import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Index } from 'algoliasearch';
import { Component, OnInit, ChangeDetectionStrategy, Inject, Input } from '@angular/core';
import { OrganizationsIndex, OrganizationAlgoliaResult } from '@blockframes/utils';
import { Organization } from '@blockframes/organization/+state';

@Component({
  selector: '[control] organization-autocomplete',
  templateUrl: './organization-autocomplete.component.html',
  styleUrls: ['./organization-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAutocompleteComponent implements OnInit {
  @Input() control: FormControl;
  public searchResults$: Observable<OrganizationAlgoliaResult[]>;
  constructor(@Inject(OrganizationsIndex) private organizationIndex: Index) { }

  ngOnInit() {
    this.searchResults$ = this.control.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(name => {
        return new Promise<OrganizationAlgoliaResult[]>((res, rej) => {
          this.organizationIndex.search(name, (err, result) => (err ? rej(err) : res(result.hits)));
        });
      })
    );
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  public selected(event: MatAutocompleteSelectedEvent) {
    this.control.setValue(event.option.value)
  }
}
