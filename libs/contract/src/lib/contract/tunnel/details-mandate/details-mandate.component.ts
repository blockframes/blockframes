import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';

@Component({
  selector: 'contract-details-mandate',
  templateUrl: './details-mandate.component.html',
  styleUrls: ['./details-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsMandateComponent {

  constructor(private tunnel: ContractTunnelComponent) { }

  get parties() {
    return this.tunnel.contractForm.get('parties');
  }

  get historizedVersions() {
    return this.tunnel.contractForm.get('historizedVersions');
  }

  public terms(index: number) {
    return this.historizedVersions.at(index).get('scope');
  }

  public conditions(index: number) {
    return this.historizedVersions.at(index).get('renewalConditions')
  }

  public terminations(index: number) {
    return this.historizedVersions.at(index).get('terminationConditions');
  }

  public fees(index: number) {
    return this.historizedVersions.at(index).get('authorizedRecoupableExpenses')
  }
}
