import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'movie-form-origin-country',
  templateUrl: './origin-country.component.html',
  styleUrls: ['./origin-country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginCountryComponent {
  @Input() form: FormControl;

  constructor() { }



}
