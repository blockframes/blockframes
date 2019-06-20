import { ChangeDetectionStrategy, OnInit, Component } from "@angular/core";
import { Observable } from "rxjs";

import { MatDialog } from "@angular/material/dialog";

import { network } from "@env";
import { WalletQuery, Wallet } from "../+state";


@Component({
  selector: 'wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletViewComponent implements OnInit {

  wallet$: Observable<Wallet>;
  amount: number;
  isLoading$: Observable<boolean>;

  constructor(
    public query: WalletQuery,
    private dialog: MatDialog
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
}
