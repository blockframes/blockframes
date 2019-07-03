import { ChangeDetectionStrategy, OnInit, Component } from "@angular/core";
import { Observable } from "rxjs";

import { network } from "@env";
import { WalletQuery, Wallet, WalletService } from "../+state";
import { Key } from "../../key-manager/+state";


@Component({
  selector: 'wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletViewComponent implements OnInit {

  wallet$: Observable<Wallet>;
  isLoading$: Observable<boolean>;

  constructor(
    public service: WalletService,
    public query: WalletQuery
  ) {}

  ngOnInit() {
    this.wallet$ = this.query.select();
    this.isLoading$ = this.query.selectLoading();
  }

  get explorerUrl() {
    return network === 'homestead' as string
      ? 'https://etherscan.io/address/'
      : `https://${network}.etherscan.io/address/`;
  }

  async deployERC1077() {
    const res = await this.service.deployERC1077(this.query.getValue().ensDomain);
    console.log(res);
  }

  // TODO implment this function : issue 544
  importKey() {
    console.warn('NOT IMPLEMENTED');
  }

  // TODO implment this function : issue 543
  addKey() {
    console.warn('NOT IMPLEMENTED');
  }

  // TODO implment this function : issue 542
  deleteKey(key: Key) {
    console.warn('NOT IMPLEMENTED');
  }
}
