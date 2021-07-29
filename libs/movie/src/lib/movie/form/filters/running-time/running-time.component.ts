import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

export const filters = {
  // 0 is all values
  1: {
    label: '< 13min',
    filter: 'runningTime.time < 13'
  },
  2: {
    label: '13min - 26min',
    filter: 'runningTime.time: 13 TO 26'
  },
  3: {
    label: '26min - 52min',
    filter: 'runningTime.time: 26 TO 52'
  },
  4: {
    label: '52min - 90min',
    filter: 'runningTime.time: 52 TO 90'
  },
  5: {
    label: '90min - 180min',
    filter: 'runningTime.time: 90 TO 180'
  },
  6: {
    label: '> 180min',
    filter: 'runningTime.time > 180'
  }
}

@Component({
  selector: '[form] filter-running-time',
  templateUrl: './running-time.component.html',
  styleUrls: ['./running-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunningTimeFilterComponent {
  @Input() form: FormControl;

  filters = filters;
}
