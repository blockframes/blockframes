import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
