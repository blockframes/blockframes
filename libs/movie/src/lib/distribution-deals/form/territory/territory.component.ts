// Material
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';

// RxJs
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Angular
import { ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';

// Others
import { DistributionDealForm } from '../distribution-deal.form';
import { territoryValidator } from '@blockframes/utils/form/validators/validators';
import {
  getCodeIfExists,
  default as staticModels,
  SlugAndLabel
} from '@blockframes/movie/movie/static-model/staticModels';
import { TERRITORIES_SLUG } from '@blockframes/movie/movie/static-model/types';

@Component({
  selector: '[form] distribution-form-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTerritoryComponent implements OnInit {
  @Input() form: DistributionDealForm;

  public includedTerritories: string[] = [];

  public excludedTerritories: string[] = [];

  public staticTerritories = staticModels['TERRITORIES'];

  public includedControl: FormControl = new FormControl('', territoryValidator);

  public excludedControl: FormControl = new FormControl('', territoryValidator);

  // Lets the user use the command to add more territories
  public separatorKeysCodes: number[] = [ENTER];

  public filteredIncludedTerritories$: Observable<string[] | SlugAndLabel[]>;

  public filteredExcludedTerritories$: Observable<string[] | SlugAndLabel[]>;

  // For included territories
  @ViewChild('includedInput', { static: false })
  includedTerritoryInput: ElementRef<HTMLInputElement>;

  @ViewChild('includedAuto', { static: false }) includedAuto: MatAutocomplete;

  // For excluded territories
  @ViewChild('excludedInput', { static: false })
  excludedTerritoryInput: ElementRef<HTMLInputElement>;

  @ViewChild('excludedAuto', { static: false }) excludedAuto: MatAutocomplete;

  ngOnInit() {
    this.filteredIncludedTerritories$ = this.includedControl.valueChanges.pipe(
      startWith(this.includedControl.value),
      map((territory: string | null) =>
        territory ? this.territoryFilter(territory) : this.staticTerritories.slice()
      )
    );

    this.filteredExcludedTerritories$ = this.excludedControl.valueChanges.pipe(
      startWith(this.excludedControl.value),
      map((territory: string | null) =>
        territory ? this.territoryFilter(territory) : this.staticTerritories.slice()
      )
    );
  }
// TODO(MF) Mat error doenst show up, why????
  public includedAdd(event: MatChipInputEvent) {
    if (!this.includedAuto.isOpen) {
      const input = event.input;
      const value = event.value.trim();

      // Add the territory
      if (
        (value || '') &&
        !this.includedTerritories.includes(value) &&
        TERRITORIES_SLUG.includes(value)
      ) {
        if (!this.excludedTerritories.includes(getCodeIfExists('TERRITORIES', value))) {
          this.includedTerritories.push(value);
          this.form.addIncludedTerritory(value);
        } else {
          this.includedControl.setErrors({ territoryAlreadyExists: true });
        }
      } else {
        this.includedControl.setErrors({ territoryValidator: true });
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.includedControl.setValue(null);
    }
  }

  public excludedAdd(event: MatChipInputEvent) {
    if (!this.excludedAuto.isOpen) {
      const input = event.input;
      const value = event.value.trim();

      // Add the territory
      if (
        (value || '') &&
        !this.excludedTerritories.includes(value) &&
        TERRITORIES_SLUG.includes(value)
      ) {
        if (!this.includedTerritories.includes(getCodeIfExists('TERRITORIES', value))) {
          this.excludedTerritories.push(value);
          this.form.addExcludedTerritory(value);
        } else {
          this.excludedControl.setErrors({ territoryAlreadyExists: true });
        }
      } else {
        this.excludedControl.setErrors({ territoryValidator: true });
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.excludedControl.setValue(null);
    }
  }

  public removeIncluded(territory: string) {
    const index = this.includedTerritories.indexOf(territory);

    if (index >= 0) {
      this.includedTerritories.splice(index, 1);
      this.form.removeIncludedTerritory(index);
    }
  }

  public removeExcluded(territory: string) {
    const index = this.excludedTerritories.indexOf(territory);

    if (index >= 0) {
      this.excludedTerritories.splice(index, 1);
      this.form.removeExcludedTerritory(index);
    }
  }

  public includedSelected(event: MatAutocompleteSelectedEvent) {
    if (
      !this.includedTerritories.includes(event.option.viewValue) &&
      TERRITORIES_SLUG.includes(event.option.value)
    ) {
      if (!this.excludedTerritories.includes(event.option.viewValue)) {
        this.form.addIncludedTerritory(event.option.value);
        this.includedTerritories.push(event.option.viewValue);
      } else {
        this.includedControl.setErrors({ territoryAlreadyExists: true });
      }
    } else {
      this.includedControl.setErrors({ territoryValidator: true });
    }
    this.includedTerritoryInput.nativeElement.value = '';
    this.includedControl.reset();
  }

  public excludedSelected(event: MatAutocompleteSelectedEvent) {
    if (
      !this.excludedTerritories.includes(event.option.viewValue) &&
      TERRITORIES_SLUG.includes(event.option.value)
    ) {
      if (!this.includedTerritories.includes(event.option.viewValue)) {
        this.form.addExcludedTerritory(event.option.value);
        this.excludedTerritories.push(event.option.viewValue);
      } else {
        this.excludedControl.setErrors({ territoryAlreadyExists: true });
      }
    } else {
      this.excludedControl.setErrors({ territoryValidator: true });
    }
    this.excludedTerritoryInput.nativeElement.value = '';
    this.excludedControl.reset();
  }

  private territoryFilter(value: string): SlugAndLabel[] {
    const filterValue = value.toLowerCase();
    return this.staticTerritories.filter(territory => territory.slug.trim().includes(filterValue));
  }
}
