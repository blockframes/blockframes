import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent {

  public navLinks = [{
    path: 'main',
    label: 'Main Information'
  },
  {
    path: 'artistic',
    label: 'Artistic Information'
  },
  {
    path: 'additional',
    label: 'Additional Information'
  },
  {
    path: 'finance',
    label: 'Financing Conditions'
  },
  {
    path: 'avails',
    label: 'Avails'
  }];

}
