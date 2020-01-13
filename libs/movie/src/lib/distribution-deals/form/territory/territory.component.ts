// Material
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';

// RxJs
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Angular
import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
import { SlugAndLabel, default as staticModels } from './../../../movie/static-model/staticModels';
import { DistributionDealForm } from '../distribution-deal.form';

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

  public includedControl: FormControl = new FormControl('');

  public excludedControl: FormControl = new FormControl('');

  // Lets the user use the command to add more territories
  public separatorKeysCodes: number[] = [ENTER, COMMA];

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
  // TOD (MF) check if territory is already inside
  // and update the form control
  public includedAdd(event: MatChipInputEvent) {
    if (!this.includedAuto.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add the territory
      if ((value || '').trim() && !this.includedTerritories.includes(value.trim())) {
        this.includedTerritories.push(value.trim());
        this.form.addTerritory(value.trim());
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
      const value = event.value;

      // Add the territory
      if ((value || '').trim() && this.excludedTerritories.includes(value)) {
        this.excludedTerritories.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.excludedControl.setValue(null);
    }
  }

  public removeIncluded(fruit: string) {
    const index = this.includedTerritories.indexOf(fruit);

    if (index >= 0) {
      this.includedTerritories.splice(index, 1);
    }
  }

  public removeExcluded(fruit: string) {
    const index = this.excludedTerritories.indexOf(fruit);

    if (index >= 0) {
      this.excludedTerritories.splice(index, 1);
    }
  }

  public includedSelected(event: MatAutocompleteSelectedEvent) {
    console.log(this.includedTerritories.includes(event.option.viewValue.trim()))
    this.includedTerritories.push(event.option.viewValue);
    this.includedTerritoryInput.nativeElement.value = '';
    this.includedControl.setValue(null);
  }

  public excludedSelected(event: MatAutocompleteSelectedEvent) {
    this.excludedTerritories.push(event.option.viewValue);
    this.excludedTerritoryInput.nativeElement.value = '';
    this.excludedControl.setValue(null);
  }

  private territoryFilter(value: string): SlugAndLabel[] {
    const filterValue = value.toLowerCase();
    return this.staticTerritories.filter(territory => territory.slug.includes(filterValue));
  }
}
