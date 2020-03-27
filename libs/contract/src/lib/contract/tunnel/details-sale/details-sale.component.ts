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

  get historizedVersions() {
    return this.tunnel.contractForm.get('historizedVersions');
  }

  public terms(index: number) {
    return this.historizedVersions.at(index).get('scope');
  }
}
