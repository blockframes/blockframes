import { ChangeDetectionStrategy, OnInit, Component } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

import {
  MatSnackBar,
  MatDialog
} from "@angular/material";

import { network } from "@env";
import { RelayerWallet } from "../../relayer-wallet/relayer-wallet";
import { WalletRecoverComponent } from "../recover/recover.component";
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
  isBalanceLoading$: Observable<boolean>;
  hasKeystore$: Observable<boolean>;
  private mnemonic = new BehaviorSubject(null);
  private privateKey = new BehaviorSubject(null);
  private loadingPrivateKey = new BehaviorSubject(false);
  mnemonic$ = this.mnemonic.asObservable();
  privateKey$ = this.privateKey.asObservable();
  loadingPrivateKey$ = this.loadingPrivateKey.asObservable();

  constructor(
    public query: WalletQuery,
    private wallet: RelayerWallet,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.wallet$ = this.query.select();
    this.isBalanceLoading$ = this.query.selectLoading();
    this.hasKeystore$ = this.wallet.hasKeystore$; // TODO FIX THIS IN #315
  }

  async getPrivateKey() {
    this.loadingPrivateKey.next(true);
    try {
      const privateKey = await this.wallet.privateKey();
      this.privateKey.next(privateKey);
    } catch (err) {
      this.snackBar.open(err, 'close', { duration: 400 })
    }
    this.loadingPrivateKey.next(false);
  }

  // requestTokens() { // TODO FIX THIS IN #315
  //   this.authService.requestTokens(this.amount);
  // }
  
  recover() {
    this.dialog.open(WalletRecoverComponent, { width: '500px' });
  }

  get explorerUrl() {
    return network === 'homestead' as string
      ? 'https://etherscan.io/address/'
      : `https://${network}.etherscan.io/address/`;
  }
}