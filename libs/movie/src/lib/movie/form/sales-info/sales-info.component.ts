import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { MovieSalesInfoForm } from './sales-info.form';
import { default as staticModels, StaticModel } from '../../staticModels';
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

  public certificationsFilterCtrl: FormControl = new FormControl();
  public certifications$: Observable<StaticModel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.selectSearchSubScriptions();
  }

  get salesInfo(): MovieSalesInfoForm {
    return this.controlContainer.control as MovieSalesInfoForm;
  }

  /* Selects with search bar */
  private selectSearchSubScriptions(): void {
    this.certifications$ = this.filterSelectSearch(this.certificationsFilterCtrl, this.staticModels['CERTIFICATIONS']);
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
