import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-movie-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieTechnicalInformationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
