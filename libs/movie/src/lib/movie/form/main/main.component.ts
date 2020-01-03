import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ControlContainer } from '@angular/forms';
import { default as staticModels, SlugAndLabel } from '../../static-model/staticModels';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MovieMainForm } from './main.form';

@Component({
  selector: '[formGroup] movie-form-main, [formGroupName] movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent implements OnInit {

  public staticModels: any;
  public countriesFilterCtrl = new FormControl();
  public languagesFilterCtrl = new FormControl();
  public genresFilterCtrl = new FormControl();
  public countries$: Observable<SlugAndLabel[]>;
  public languages$: Observable<SlugAndLabel[]>;
  public genres$: Observable<SlugAndLabel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.selectSearchSubScriptions();
  }

  get main() : MovieMainForm {
    return this.controlContainer.control as MovieMainForm;
  }

  /* Selects with search bar */
  private selectSearchSubScriptions() : void {
    // this.countries$ = this.filterSelectSearch(this.main.controls['originCountries'], this.staticModels['TERRITORIES']);
    this.languages$ = this.filterSelectSearch(this.languagesFilterCtrl, this.staticModels['LANGUAGES']);
    this.genres$ = this.filterSelectSearch(this.genresFilterCtrl, this.staticModels['GENRES']);
  }

  private filterSelectSearch(control: FormControl, model: SlugAndLabel[]) {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => model.filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }

}
