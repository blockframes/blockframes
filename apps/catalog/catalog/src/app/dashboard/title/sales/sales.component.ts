import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent {
  public contracts$ = this.contractQuery.selectAll();

  constructor(private contractQuery: ContractQuery) {}
}
