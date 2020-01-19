import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class TitleViewComponent implements OnInit {
  navLinks = [{
    path: 'sales',
    label: 'Sales'
  }, {
    path: 'details',
    label: 'Film Details'
  },{
    path: 'avails',
    label: 'Avails'
  }];
  constructor() { }

  ngOnInit() {
  }

}
