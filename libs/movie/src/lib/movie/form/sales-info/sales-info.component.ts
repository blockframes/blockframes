import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { MovieSalesInfoForm } from './sales-info.form';
import { default as staticModels, SlugAndLabel } from '../../static-model/staticModels';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: '[formGroup] movie-form-sales-info, [formGroupName] movie-form-sales-info',
  templateUrl: './sales-info.component.html',
  styleUrls: ['./sales-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesInfoComponent implements OnInit {

  public staticModels: any;
  public europeanQualification: false;

  public certificationsFilterCtrl = new FormControl();
  public certifications$: Observable<SlugAndLabel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    // Init search bar
    this.certifications$ = this.certificationsFilterCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => this.staticModels['CERTIFICATIONS'].filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }

  get salesInfo(): MovieSalesInfoForm {
    return this.controlContainer.control as MovieSalesInfoForm;
  }

}
