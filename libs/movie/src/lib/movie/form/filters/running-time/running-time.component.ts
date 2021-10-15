import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { runningTimeFilters } from '../../search.form';

@Component({
  selector: '[form] filter-running-time',
  templateUrl: './running-time.component.html',
  styleUrls: ['./running-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunningTimeFilterComponent {
  @Input() form: FormControl;

  filters = runningTimeFilters;
}
