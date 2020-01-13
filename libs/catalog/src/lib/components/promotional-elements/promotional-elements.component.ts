import { PromotionalElement } from '@blockframes/movie/types';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'catalog-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss']
})
export class CatalogPromotionalElementsComponent {
  @Output() promoReelOpened = new EventEmitter();
  public elements: PromotionalElement[];

  @Input()
  set promotionalElements(promotionalElements: PromotionalElement[]) {
    this.elements = [
      ...promotionalElements.filter(el => el.type === 'reel' || el.type === 'scenario'),
      ...promotionalElements.filter(el => el.type === 'screener' || el.type === 'trailer' || el.type === 'teaser')
    ]
  }
}
