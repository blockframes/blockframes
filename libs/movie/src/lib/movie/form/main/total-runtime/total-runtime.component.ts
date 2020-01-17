import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMainControl } from '../main.form';

@Component({
  selector: '[form] movie-form-total-runtime',
  templateUrl: './total-runtime.component.html',
  styleUrls: ['./total-runtime.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalRuntimeComponent {

  @Input() form: MovieMainControl['totalRunTime'];

}
