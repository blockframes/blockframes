import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { default as staticModel } from '../../../static-model/staticModels'
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: '[form] movie-form-origin-country',
  templateUrl: './origin-country.component.html',
  styleUrls: ['./origin-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginCountryComponent implements OnInit {
  @Input() form: FormControl;
  countries = staticModel.TERRITORIES;

  filteredCountries$: Observable<typeof staticModel.TERRITORIES>;

  ngOnInit() {
    this.filteredCountries$ = this.form.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(country => country ? this._filter(country) : this.countries.slice())
      );
  }

  private _filter(country: string) {
    const filterValue = country.toLowerCase();
    return this.countries.filter(({ label }) => label.toLowerCase().indexOf(filterValue) === 0)
  }
}
