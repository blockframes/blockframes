import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsSaleComponent {

  constructor(private tunnel: ContractTunnelComponent) {}

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
