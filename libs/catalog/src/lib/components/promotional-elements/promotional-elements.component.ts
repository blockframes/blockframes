import { PromotionalElement } from '@blockframes/movie/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'catalog-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styles: ['./promotional-elements.component.scss']
})
export class CatalogPromotionalElementsComponent {
  @Input() promotionalElements: PromotionalElement[];
}
