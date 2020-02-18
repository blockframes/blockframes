import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePromotionalElementForm } from '../promotional-elements.form';

const links = [
  {
    label: 'Promo reel link',
    key: 'promo_reel_link'
  },{
    label: 'Screener link',
    key: 'screener_link'
  },{
    label: 'Trailer link',
    key: 'trailer_link'
  },{
    label: 'Pitch Teaser link',
    key: 'teaser_link'
  }
]
@Component({
  selector: '[form] movie-form-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalLinksComponent {
  @Input() form: MoviePromotionalElementForm;

  public links = links;
}
