import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SlugAndLabel } from './../../static-model/staticModels';
import { FormControl } from '@angular/forms';
import { MovieVersionInfoForm } from './version-info.form';
import { MovieMainForm } from './../main/main.form';
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { default as staticModels } from '../../static-model/staticModels';

@Component({
  selector: '[form] movie-form-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormVersionInfoComponent implements OnInit {

  @Input() form: MovieVersionInfoForm

  public staticModels: any;

  public languagesFilterCtrl = new FormControl();
  public languages$: Observable<SlugAndLabel[]>;

  ngOnInit() {
    this.staticModels = staticModels.LANGUAGES;
    this.languages$ = this.languagesFilterCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => this.staticModels.filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }


}
