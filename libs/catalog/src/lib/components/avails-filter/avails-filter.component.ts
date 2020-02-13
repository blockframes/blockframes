import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AvailsSearchForm } from '@blockframes/catalog/form/search.form';
import { MediasSlug, MEDIAS_SLUG, TerritoriesSlug, TERRITORIES_LABEL } from '@blockframes/utils/static-model';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, debounceTime, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ExtractCode, getCodeIfExists } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'catalog-avails-filter',
  templateUrl: './avails-filter.component.html',
  styleUrls: ['./avails-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent implements OnInit{
  @Input() availsForm: AvailsSearchForm;
  @Input() territories = false;


  public movieMedias: MediasSlug[] = MEDIAS_SLUG;

  /* Arrays for showing the selected entities in the UI */
  public selectedMovieTerritories: string[] = [];
  public territoriesFilter$: Observable<string[]>;
  public territoryControl: FormControl = new FormControl('');

  /* Flags for the Territories chip input */
  public visibleTerritory = true;
  public selectableTerritory = true;
  public removableTerritory = true;

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  ngOnInit() {
    this.territoriesFilter$ = this.territoryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(territory => this._territoriesFilter(territory))
    );
  }

  /** Check media or uncheck it if it's already in the array. */
  public checkMedia(media: MediasSlug) {
    if (this.movieMedias.includes(media)) {
      this.availsForm.checkMedia(media);
    }
  }

    /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return TERRITORIES_LABEL.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  public removeTerritory(territory: string, index: number) {
    const i = this.selectedMovieTerritories.indexOf(territory);

    if (i >= 0) {
      this.selectedMovieTerritories.splice(i, 1);
    }
    this.availsForm.removeTerritory(index);
  }

  public selectedTerritory(territory: MatAutocompleteSelectedEvent) {
    if (!this.selectedMovieTerritories.includes(territory.option.viewValue)) {
      this.selectedMovieTerritories.push(territory.option.value);
    }
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const territorySlug: TerritoriesSlug = getCodeIfExists(
      'TERRITORIES',
      territory.option.viewValue as ExtractCode<'TERRITORIES'>
    );
    this.availsForm.addTerritory(territorySlug);
    this.territoryInput.nativeElement.value = '';
  }

  public applyAvailsFilter() {
    this.availsForm.get('isActive').setValue(true);
    this.availsForm.disable();
    this.territoryControl.disable();
    // TODO: use controls for territories and medias to make it disablable.
  }

  public deactivateAvailsFilter() {
    this.availsForm.get('isActive').setValue(false);
    this.availsForm.enable();
    this.territoryControl.enable();
  }
}
