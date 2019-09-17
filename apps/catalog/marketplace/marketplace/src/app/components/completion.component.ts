import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'catalog-completion-item',
  template: `
  <main fxLayout="row" fxLayoutAlign="center center">
    <feedback-message
    title="Congratulation!"
    subTitle="Your bid successfuly processed."
    imageUrl="/assets/images/bid-success.png"
    (redirectUser)="navigate()">
    </feedback-message>
  </main>`,
  styleUrls: ['./completion.component.scss']
})

export class CatalogCompletionComponent {
  constructor(private router: Router) {}

  public navigate() {
    this.router.navigateByUrl('layout/o/catalog/search');
  }
}
