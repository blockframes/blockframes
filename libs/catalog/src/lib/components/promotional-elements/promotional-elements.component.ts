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

  @Input() promotionalElements: MoviePromotionalElements
}
