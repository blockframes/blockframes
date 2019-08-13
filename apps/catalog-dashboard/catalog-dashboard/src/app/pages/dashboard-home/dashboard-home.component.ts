import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogDashboardHomeComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    
  }
}
