import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingPageComponent implements OnInit {
  constructor(){}

  ngOnInit() {

  }
}
