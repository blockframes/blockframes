import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieMainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
