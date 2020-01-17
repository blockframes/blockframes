import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { default as staticModel } from '@blockframes/utils/static-model/staticModels'
import { FormStaticValue } from '@blockframes/utils/form';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

type TERRITORIES = typeof staticModel.TERRITORIES;

@Component({
  selector: '[form] form-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCountryComponent implements OnInit {
  @Input() form: FormStaticValue<'TERRITORIES'>;
  countries = staticModel.TERRITORIES;

  filteredCountries$: Observable<TERRITORIES>;

  ngOnInit() {
    this.filteredCountries$ = this.form.valueChanges
      .pipe(
        startWith(''),
        map(country => country ? this._filter(country) : this.countries)
      );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    if (key) {
      return staticModel.TERRITORIES.find(({ slug }) => slug === key).label;
    }
  }

  private _filter(country: string): TERRITORIES {
    const filterValue = country.toLowerCase();
    return this.countries.filter(({ label }) => label.toLowerCase().indexOf(filterValue) === 0) as any
  }
}
