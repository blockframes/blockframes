import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-avails-filter',
  templateUrl: './avails-filter.component.html',
  styleUrls: ['./avails-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
