import { Component } from '@angular/core';

@Component({
  selector: 'catalog-reserved-territories',
  template: `
    <h3>Reserved territories</h3>
    <p class="bf-dark-text">Territories</p>
    <div fxLayout="row wrap">
      <span *ngFor="let territory of reservedTerritories; let isLast = last" class="text">
      {{ territory }}{{isLast ? '' : ', '}}</span>
    </div>
  `,
  styles: [`.text {
    margin: 2px
  }`]
})
export class CatalogReservedTerritoriesComponent {
  public reservedTerritories: string[] = [
    'France (The Jokers)',
    'USA (Paramount)',
    'UK (Avalance)'
  ];
}
