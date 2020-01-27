import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'catalog-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent {
  // Get all organization's contract and return them with all their versions.
  public contracts$ = this.contractQuery.selectAll();

  constructor(private contractQuery: ContractQuery) {}
}
