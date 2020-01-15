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
  /**
   * @description returns a filtered array of all possible territories depending on the value param
   * @param value string of what the users typed in
   */
  private territoryFilter(value: string): SlugAndLabel[] {
    const filterValue = value.toLowerCase();
    return this.staticTerritories.filter(territory => territory.slug.trim().includes(filterValue));
  }

  /**
   * @description resusable function that checks if a territory has already been aded
   * to the other input field
   * @param type either territory or territoryExcluded depinding on what array we want to operate
   * @param territory the string of what the user would like to add
   */
  private isInThisOther(type: TerritoryType, territory: string) {
    return type === 'territory'
      ? this.value['territoryExcluded'].includes(territory)
      : this.value['territory'].includes(territory);
  }

  /**
   * @description checks what type has been inputted
   * @param type is one of the possible TerritoryType
   */
  private isTerritoryType(type: TerritoryType): string | boolean {
    if (type === 'territory') {
      return type;
    } else if (type === 'territoryExcluded') {
      return type;
    }
    return false;
  }

  /**
   * @description resusable function that checks if the territory param has already been added
   * and if the territory is a valid one
   * @param type either territory or territoryExcluded depinding on what array we want to operate
   * @param territory the string of what the user would like to add
   */
  private isValidTerritoryAndNoDuplicate(type: TerritoryType, territory: string): boolean {
    return (
      !this.value[type].includes(territory) &&
      TERRITORIES_SLUG.includes(getCodeIfExists('TERRITORIES', territory)) &&
      !this.isInThisOther(type, territory)
    );
  }

  /**
   * @description adds a territory when the user typed in territory, also resets the input field
   * @param event the event that was emitted by the chip input
   * @param type either territory or territoryExcluded depinding on what array we want to operate
   */
  public addTerritory(event: MatChipInputEvent, type: TerritoryType) {
    if (!this.isTerritoryType(type)) {
      throw new Error(`Not supported type: ${type} `);
    }
    if (!this.includedAuto.isOpen) {
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

  /**
   * @description removes a territory from the input and form
   * @param territory territory to be removed
   * @param type either territory or territoryExcluded depinding on what array we want to operate
   */
  public removeTerritory(territory: string, type: TerritoryType) {
    const index = this.value[type].indexOf(territory);
    if (index >= 0) {
      this.value[type].splice(index, 1);
      this.form.removeTerritory(index, type);
    }
  }

  /**
   * @description adds a territory when the user clicks on an option provided by the autocompletion
   * @param event event that got emiited by the autocompletion
   * @param type either territory or territoryExcluded depinding on what array we want to operate
   */
  public selectedTerritory(event: MatAutocompleteSelectedEvent, type: TerritoryType) {
    if (this.isValidTerritoryAndNoDuplicate(type, event.option.viewValue)) {
      this.form.addTerritory(event.option.value, type);
      this.value[type].push(event.option.viewValue);
      this.controls[type].reset();
      if (this.isTerritoryType(type) === 'territory') {
        this.includedTerritoryInput.nativeElement.value = '';
      }
      this.excludedTerritoryInput.nativeElement.value = '';
    }
  }
}
