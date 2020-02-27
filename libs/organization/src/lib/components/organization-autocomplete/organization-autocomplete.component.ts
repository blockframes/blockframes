import { switchMap, pluck } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Index } from 'algoliasearch';
import { Component, OnInit, ChangeDetectionStrategy, Inject, Input, EventEmitter, Output } from '@angular/core';
import { OrganizationsIndex, OrganizationAlgoliaResult } from '@blockframes/utils';

@Component({
  selector: '[control] organization-autocomplete',
  templateUrl: './organization-autocomplete.component.html',
  styleUrls: ['./organization-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAutocompleteComponent implements OnInit {
  @Input() control: FormControl;
  @Input() label?: string;
  @Output() emitSelect = new EventEmitter();
  public searchResults$: Observable<OrganizationAlgoliaResult[]>;

  constructor(@Inject(OrganizationsIndex) private organizationIndex: Index) { }

  async ngOnInit() {
    this.searchResults$ = this.control.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(text => this.organizationIndex.search(text)),
      pluck('hits')
    );
  }

  public selected(event: MatAutocompleteSelectedEvent) {
    if (event.option.value.objectID) {
      this.emitSelect.emit(event);
    } else {
      /**
       * If the user change the org name to a non existing org,
       * we want to erase the ID fromt he form
       */
      this.emitSelect.emit('')
    }
  }
}
