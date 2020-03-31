import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsSaleComponent {

  constructor(private tunnel: ContractTunnelComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Create a contract offer', 'Overview')
  }

  get parties() {
    return this.tunnel.contractForm.get('parties')
  }

  get lastVersion() {
    return this.tunnel.contractForm.get('lastVersion');
  }

  public terms() {
    return this.lastVersion.get('scope');
  }
}
