import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';


@Component({
  selector: 'contract-details-mandate',
  templateUrl: './details-mandate.component.html',
  styleUrls: ['./details-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsMandateComponent {

  constructor(
    private tunnel: ContractTunnelComponent,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Create a contract offer', 'Overview')
  }

  get parties() {
    return this.tunnel.contractForm.get('parties');
  }

  get lastVersion() {
    return this.tunnel.contractForm.get('lastVersion');
  }

  public terms() {
    return this.lastVersion.get('scope');
  }

  public conditions() {
    return this.lastVersion.get('renewalConditions')
  }

  public terminations() {
    return this.lastVersion.get('terminationConditions');
  }

  public fees() {
    return this.lastVersion.get('authorizedRecoupableExpenses')
  }
}
