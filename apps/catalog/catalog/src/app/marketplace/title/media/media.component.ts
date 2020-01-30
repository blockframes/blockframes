import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-movie-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieMediaComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
