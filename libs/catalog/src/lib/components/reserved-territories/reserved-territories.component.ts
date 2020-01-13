import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-reserved-territories',
  template: `
    <p class="bf-dark-text">Reserved territories</p>
    <div fxLayout="row wrap">
      <span *ngFor="let territory of reservedTerritories; let isLast = last" class="text">
      {{ territory }}{{isLast ? '' : ', '}}</span>
    </div>
  `,
  styles: [`.text {
    margin: 2px
  }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogReservedTerritoriesComponent {
  @Input() reservedTerritories: string[];
}
