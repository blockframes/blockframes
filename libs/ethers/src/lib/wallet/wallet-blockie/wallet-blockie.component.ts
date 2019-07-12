import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import makeBlockie from 'ethereum-blockies-base64';
import { utils } from 'ethers';

@Component({
  selector: 'wallet-blockie',
  templateUrl: './wallet-blockie.component.html',
  styleUrls: ['./wallet-blockie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletBlockieComponent {
  public ethBlockie: string;

  @Input()
  set address(address: string) {
    this.ethBlockie = makeBlockie(utils.getAddress(address));
  }
}
