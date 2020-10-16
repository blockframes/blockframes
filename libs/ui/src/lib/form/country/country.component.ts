import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormStaticValue } from '@blockframes/utils/form';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { territories, Territory } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] form-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCountryComponent implements OnInit {
  @Input() form: FormStaticValue<'territories'>;
  @Input() @boolean noWorld = false

  territories = territories;
  countries: Territory[];
  filteredCountries$: Observable<Territory[]>;

  ngOnInit() {
    this.countries = this.noWorld
      ? Object.keys(territories).filter(country => country !== 'world') as Territory[]
      : Object.keys(territories) as Territory[];
    this.filteredCountries$ = this.form.valueChanges
      .pipe(
        startWith(''),
        map((country: Territory) => country ? this._filter(country) : this.countries)
      );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    if (key) {
      return territories[key];
    }
  }

  private _filter(country: string) {
    const filterValue = country.toLowerCase();
    return this.countries.filter(territory => territory.toLowerCase().indexOf(filterValue) === 0) as Territory[]
  }
}
