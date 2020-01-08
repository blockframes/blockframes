import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { default as staticModels, SlugAndLabel } from '../../static-model/staticModels';
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

  public languagesFilterCtrl = new FormControl();
  public languages$: Observable<SlugAndLabel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    // Init search bar
    this.languages$ = this.languagesFilterCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => this.staticModels['LANGUAGES'].filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }

  get versionInfo(): MovieVersionInfoForm {
    return this.controlContainer.control as MovieVersionInfoForm;
  }
}
