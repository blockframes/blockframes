import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePromotionalElementLinkForm } from '../promotional-elements.form';

const links = [
  {
    label: 'Promo reel Link',
    key: 'promo_reel_link'
  },{
    label: 'Screener Link',
    key: 'screener_link'
  },{
    label: 'Trailer Link',
    key: 'trailer_link'
  },{
    label: 'Pitch Teaser Link',
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
  @Input() form: MoviePromotionalElementLinkForm;

  public links = links;
}
