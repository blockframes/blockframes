import { Component, OnInit, Input, Inject } from '@angular/core';
import { network } from '@env';

@Component({
  selector: 'wallet-address-view',
  templateUrl: './wallet-address-view.component.html',
  styleUrls: ['./wallet-address-view.component.scss']
})
export class WalletAddressViewComponent implements OnInit {
  @Input() public ensName: string;
  @Input() public ethAddress: string;

  constructor() {}

  ngOnInit() {}

  public get url(): string {
    return network === 'homestead' as string
    ? `https://etherscan.io/address/${this.ethAddress}`
    : `https://${network}.etherscan.io/address/${this.ethAddress}`;
  }
}
