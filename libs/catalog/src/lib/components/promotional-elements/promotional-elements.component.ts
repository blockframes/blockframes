import { Component, Input } from '@angular/core';

@Component({
  selector: 'catalog-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styles: [
    `
      article {
        width: 100%;
      }
      div {
        width: 50%;
      }
      a {
        color: var(--white);
      }
    `
  ]
})
export class CatalogPromotionalElementsComponent {
@Input() promotionEl;
}
