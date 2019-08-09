import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-marketplace-search',
  templateUrl: './marketplace-search.component.html',
  styleUrls: ['./marketplace-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit{
  constructor() {}
  ngOnInit() {
    
  }
}
