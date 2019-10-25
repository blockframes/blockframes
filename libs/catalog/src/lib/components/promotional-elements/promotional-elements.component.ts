import { Component } from '@angular/core';

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
  public promotionEl = [
    { type: 'Trailer', hyperlinkText: 'Watch', link: 'https://www.youtube.com/watch?v=Qs_dPc62smw' }
  ];
}
