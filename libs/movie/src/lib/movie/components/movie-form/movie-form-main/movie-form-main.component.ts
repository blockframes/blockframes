import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MovieForm } from '../movie.form';
import { FormControl } from '@angular/forms';
import { default as staticModels } from '../../../staticModels';
import { Observable } from 'rxjs';
import { distinctUntilChanged, startWith, debounceTime, map } from 'rxjs/operators';

interface StaticModel {
  label: string;
  slug: string;
}

@Component({
  selector: 'movie-form-main',
  templateUrl: './movie-form-main.component.html',
  styleUrls: ['./movie-form-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent implements OnInit {

  public staticModels: any;
  public countriesFilterCtrl: FormControl = new FormControl();
  public languagesFilterCtrl: FormControl = new FormControl();
  public genresFilterCtrl: FormControl = new FormControl();
  public countries$: Observable<StaticModel[]>;
  public languages$: Observable<StaticModel[]>;
  public genres$: Observable<StaticModel[]>;

  constructor(public form: MovieForm) {}

  ngOnInit() {
    this.staticModels = staticModels;
    this._selectSearchSubScriptions();
  }

  /* Selects with search bar */
  private _selectSearchSubScriptions() : void {
    this.countries$ = this.filterSelectSearch(this.countriesFilterCtrl, this.staticModels['COUNTRIES']);
    this.languages$ = this.filterSelectSearch(this.languagesFilterCtrl, this.staticModels['LANGUAGES']);
    this.genres$ = this.filterSelectSearch(this.genresFilterCtrl, this.staticModels['GENRES']);
  }

  private filterSelectSearch(control: FormControl, model: StaticModel[]) {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => model.filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    )
  }
}
