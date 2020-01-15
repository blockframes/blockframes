import { PromotionalElement, MoviePromotionalElements } from '@blockframes/movie/types';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogPromotionalElementsComponent {
  @Output() promoReelOpened = new EventEmitter();
  public elements: PromotionalElement[];

  @Input()
  set promotionalElements(promotionalElements: MoviePromotionalElements) {
    this.elements = [
      promotionalElements.promo_reel_link,
      promotionalElements.scenario,
      promotionalElements.screener_link,
      ...promotionalElements.trailer,
      promotionalElements.trailer_link,
      promotionalElements.teaser_link
    ]
  }
}
