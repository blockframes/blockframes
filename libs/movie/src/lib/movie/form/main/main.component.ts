import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { default as staticModels, SlugAndLabel } from '../../static-model/staticModels';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MovieForm } from '../movie.form';

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
  // @todo (#1463)
  // public main = new MovieMainForm(this.query.getForm().main)
  // no more control container
  public genres$: Observable<SlugAndLabel[]>;

  constructor(private form: MovieForm) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.selectSearchSubScriptions();
  }

  get main() {
    return this.form.get('main');
  }

  /* Selects with search bar */
  private selectSearchSubScriptions() : void {
    this.countries$ = this.filterSelectSearch(this.countriesFilterCtrl, this.staticModels['TERRITORIES']);
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
