import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[form] movie-form-total-runtime',
  templateUrl: './total-runtime.component.html',
  styleUrls: ['./total-runtime.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalRuntimeComponent {

  @Input() form;

}
