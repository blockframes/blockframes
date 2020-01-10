import { Component, ChangeDetectionStrategy, Input  } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form] movie-form-production-year',
  templateUrl: './production-year.component.html',
  styleUrls: ['./production-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionYearComponent {
  @Input() form: FormControl;
}
