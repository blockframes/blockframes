import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'material-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {

  constructor() { }
}
