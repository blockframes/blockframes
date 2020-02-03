import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';

@Component({
  selector: 'catalog-title-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAvailsComponent {
  public contracts$ = this.contractQuery.selectAll();

  constructor(private contractQuery: ContractQuery) {}
}
