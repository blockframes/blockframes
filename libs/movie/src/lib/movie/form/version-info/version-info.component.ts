import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { default as staticModels, StaticModel } from '../../staticModels';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { MovieVersionInfoForm } from './version-info.form';

@Component({
  selector: '[formGroup] movie-form-version-info, [formGroupName] movie-form-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormVersionInfoComponent implements OnInit {

  public staticModels: any;
  public europeanQualification: false;

  public languagesFilterCtrl: FormControl = new FormControl();
  public languages$: Observable<StaticModel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.selectSearchSubScriptions();
  }

  get versionInfo(): MovieVersionInfoForm {
    return this.controlContainer.control as MovieVersionInfoForm;
  }

  /* Selects with search bar */
  private selectSearchSubScriptions(): void {
    this.languages$ = this.filterSelectSearch(this.languagesFilterCtrl, this.staticModels['LANGUAGES']);
  }

  private filterSelectSearch(control: FormControl, model: StaticModel[]) {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => model.filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }

}
