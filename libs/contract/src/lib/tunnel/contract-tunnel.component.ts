import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'contract-tunnel-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ContractForm]
})
export class ContractTunnelComponent {}
