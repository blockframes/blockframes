import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'catalog-completion-item',
  template: `
    <main fxLayout="row" fxLayoutAlign="center center">
      <feedback-message
        [title]="header"
        [subTitle]="subTitle"
        imageUrl="/assets/images/Dark_Fine_380.png"
        (redirectUser)="navigate()"
      >
      </feedback-message>
    </main>
  `, // @todo use something else than "main" tag.
  styleUrls: ['./completion.component.scss']
})
export class CatalogCompletionComponent {
  public header = 'Everything is fine';
  public subTitle =
    'Your request has been sent. A summary email has just been sent to you. Please kindly wait for the relevant sellers to contact you.';

  constructor(private router: Router) {}

  public navigate() {
    this.router.navigateByUrl('layout/o/catalog/search');
  }
}
