import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { network } from '@env';

@Component({
  selector: 'wallet-address-view',
  templateUrl: './wallet-address-view.component.html',
  styleUrls: ['./wallet-address-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class WalletAddressViewComponent {
  @Input() public ensName: string;
  @Input() public ethAddress: string;

  public get url(): string {
    return network === 'homestead' as string
    ? `https://etherscan.io/address/${this.ethAddress}`
    : `https://${network}.etherscan.io/address/${this.ethAddress}`;
  }
}
