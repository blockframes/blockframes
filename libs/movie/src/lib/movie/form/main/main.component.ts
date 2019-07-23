import { Component, OnInit } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { default as staticModels, StaticModel } from '../../staticModels';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Component({
  selector: '[formGroupName] movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MovieFormMainComponent implements OnInit {
  
  public staticModels: any;
  public countriesFilterCtrl: FormControl = new FormControl();
  public languagesFilterCtrl: FormControl = new FormControl();
  public genresFilterCtrl: FormControl = new FormControl();
  public countries$: Observable<StaticModel[]>;
  public languages$: Observable<StaticModel[]>;
  public genres$: Observable<StaticModel[]>;

  constructor(
    public controlContainer: ControlContainer,
    private builder: FormBuilder,
  ) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.selectSearchSubScriptions();
  }

  /* Selects with search bar */
  private selectSearchSubScriptions() : void {
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
    );
  }

  public addDirector(): void {
    (this.controlContainer.control.get('directors') as FormArray)
      .push(this.builder.group({ firstName: '', lastName: '' }));
  }

  public removeDirector(i: number): void {
    (this.controlContainer.control.get('directors') as FormArray).removeAt(i);
  }

  
}
