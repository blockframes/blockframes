// Material
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';

// RxJs
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Angular
import { ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';

// Others
import { DistributionDealForm } from '../distribution-deal.form';
import {
  getCodeIfExists,
  default as staticModels,
  SlugAndLabel
} from '@blockframes/movie/movie/static-model/staticModels';
import { TERRITORIES_SLUG } from '@blockframes/movie/movie/static-model/types';

type TerritoryType = 'territory' | 'territoryExcluded';

@Component({
  selector: '[form] distribution-form-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTerritoryComponent {
  @Input() form: DistributionDealForm;

  public value = {
    territory: [],
    territoryExcluded: []
  };

  public controls = {
    territory: new FormControl(),
    territoryExcluded: new FormControl()
  };

  public $ = {
    territory: this.select('territory'),
    territoryExcluded: this.select('territoryExcluded')
  };

  public staticTerritories = staticModels['TERRITORIES'];

  // Lets the user use the command to add more territories
  public separatorKeysCodes: number[] = [ENTER];

  // For included territories
  @ViewChild(`includedInput`, { static: false })
  includedTerritoryInput: ElementRef<HTMLInputElement>;

  @ViewChild('includedAuto', { static: false }) includedAuto: MatAutocomplete;

  @ViewChild('excludedInput', { static: false })
  excludedTerritoryInput: ElementRef<HTMLInputElement>;

  @ViewChild('excludedAuto', { static: false }) excludedAuto: MatAutocomplete;

  public select(type: TerritoryType): Observable<string[] | SlugAndLabel[]> {
    return this.controls[type].valueChanges.pipe(
      startWith(this.controls[type].value),
      map(territory => {
        return territory ? this.territoryFilter(territory) : this.staticTerritories.slice();
      })
    );
  }

  private territoryFilter(value: string): SlugAndLabel[] {
    const filterValue = value.toLowerCase();
    return this.staticTerritories.filter(territory => territory.slug.trim().includes(filterValue));
  }

  private isValidTerritoryAndNoDuplicate(type: TerritoryType, territory: string): boolean {
    if (type === 'territory') {
      return (
        !this.value[type].includes(territory) &&
        TERRITORIES_SLUG.includes(getCodeIfExists('TERRITORIES', territory)) &&
        !this.value['territoryExcluded'].includes(territory)
      );
    }
    return (
      !this.value[type].includes(territory) &&
      TERRITORIES_SLUG.includes(getCodeIfExists('TERRITORIES', territory)) &&
      !this.value['territory'].includes(territory)
    );
  }

  public addTerritory(event: MatChipInputEvent, type: TerritoryType) {
    if (type === 'territory' && !this.includedAuto.isOpen) {
      const input = event.input;
      const value = event.value.trim();

      // Add the territory
      if ((value || '') && this.isValidTerritoryAndNoDuplicate(type, value)) {
        this.value[type].push(value);
        this.form.addTerritory(value, type);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.controls[type].reset();
    } else if (type === 'territoryExcluded' && !this.excludedAuto.isOpen) {
      const input = event.input;
      const value = event.value.trim();

      // Add the territory
      if ((value || '') && this.isValidTerritoryAndNoDuplicate(type, value)) {
        this.value[type].push(value);
        this.form.addTerritory(value, type);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.controls[type].reset();
    }
  }

  public removeTerritory(territory: string, type: TerritoryType) {
    const index = this.value[type].indexOf(territory);
    if (index >= 0) {
      this.value[type].splice(index, 1);
      this.form.removeTerritory(index, type);
    }
  }

  public selectedTerritory(event: MatAutocompleteSelectedEvent, type: TerritoryType) {
    if (this.isValidTerritoryAndNoDuplicate(type, event.option.viewValue)) {
      this.form.addTerritory(event.option.value, type);
      this.value[type].push(event.option.viewValue);
      this.includedTerritoryInput.nativeElement.value = '';
      this.controls[type].reset();
    } else if (this.isValidTerritoryAndNoDuplicate(type, event.option.viewValue)) {
      this.form.addTerritory(event.option.value, type);
      this.value[type].push(event.option.viewValue);
      this.excludedTerritoryInput.nativeElement.value = '';
      this.controls[type].reset();
    }
  }
}
