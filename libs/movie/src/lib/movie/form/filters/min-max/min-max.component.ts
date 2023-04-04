import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { minMaxForm } from '../../search.form';

@Component({
  selector: '[form] filter-min-max',
  templateUrl: './min-max.component.html',
  styleUrls: ['./min-max.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinMaxFilterComponent {
  @Input() form: minMaxForm;
  @Input() labels = { min: 'From', max: 'To' };
  @Input() placeholder = 'YYYY';
}
