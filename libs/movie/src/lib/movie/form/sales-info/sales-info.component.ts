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

  public countriesFilterCtrl = new FormControl();
  public ratingSystemFilterCtrl = new FormControl();
  public certificationsFilterCtrl = new FormControl();
  public mediasFilterCtrl = new FormControl();
  public countries$: Observable<SlugAndLabel[]>;
  public ratingSystems$: Observable<SlugAndLabel[]>;
  public certifications$: Observable<SlugAndLabel[]>;
  public medias$: Observable<SlugAndLabel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.countries$ = this.filterSelectSearch(this.countriesFilterCtrl, this.staticModels['TERRITORIES']);
    this.ratingSystems$ = this.filterSelectSearch(this.ratingSystemFilterCtrl, this.staticModels['RATING']);
    this.medias$ = this.filterSelectSearch(this.mediasFilterCtrl, this.staticModels['MEDIAS']);

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

  public getRatingSystem(i) {
    const control = this.salesInfo.getRating(i);
    return control.get('system').value ? control.get('system').value : 'unnamed system';
  }

  public getOriginalRelease(i) {
    const control = this.salesInfo.getOriginalRelease(i);
    return control.get('country').value ? control.get('country').value : 'unnamed release';
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
