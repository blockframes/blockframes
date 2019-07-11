import { Component, OnInit, Input } from '@angular/core';
import makeBlockie from 'ethereum-blockies-base64';
import { utils } from 'ethers';

@Component({
  selector: 'wallet-blockie',
  templateUrl: './wallet-blockie.component.html',
  styleUrls: ['./wallet-blockie.component.scss']
})
export class WalletBlockieComponent implements OnInit {
  public ethBlockie: string;

  constructor() {}

  ngOnInit() {}

  @Input()
  set address(address: string) {
    this.ethBlockie = makeBlockie(utils.getAddress(address));
  }
}
