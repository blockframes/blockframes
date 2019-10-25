import { Component } from '@angular/core';
@Component({
  selector: 'catalog-production-information',
  template: `
    <h3>Production information</h3>
    <div fxLayout="row nowrap" fxLayoutAlign="start center" fxLayoutGap="30px">
      <span><p class="bf-dark-text">Production company</p>
        <p>{{ companies.name }}</p>
      </span>
      <span><p class="bf-dark-text">Sales agent</p>
        <img [src]="companies.salesAgent"/></span>
    </div>
  `
})
export class CatalogProductionInformationComponent {
  public companies = { name: 'The Jokers', salesAgent: '/assets/icon/cross.svg' };
}
