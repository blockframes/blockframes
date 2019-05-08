import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, AuthQuery, AuthService } from '@blockframes/auth';
import { network } from '@env';
import { RelayerWallet, WalletRecoverComponent } from '@blockframes/ethers';
import { MatSnackBar, MatDialog } from '@angular/material';

@Component({
  selector: 'account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountViewComponent implements OnInit {
  user$: Observable<User>;
  panelOpenState: boolean;

  // TODO : put everything in the wallet module in the state
  isBalanceLoading$: Observable<boolean>;
  hasKeystore$: Observable<boolean>;
  private mnemonic = new BehaviorSubject(null);
  private privateKey = new BehaviorSubject(null);
  private loadingPrivateKey = new BehaviorSubject(false);
  mnemonic$ = this.mnemonic.asObservable();
  privateKey$ = this.privateKey.asObservable();
  loadingPrivateKey$ = this.loadingPrivateKey.asObservable();
  //

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private authQuery: AuthQuery,
    private wallet: RelayerWallet,
  ) {}

  get explorerUrl() {
    return network === 'homestead' as string
      ? 'https://etherscan.io/address/'
      : `https://${network}.etherscan.io/address/`;
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.isBalanceLoading$ = this.authQuery.isBalanceLoading$;
    this.hasKeystore$ = this.wallet.hasKeystore$;
  }

  // TODO : put this in the Wallet Module and factorize in one component
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
  //

  refreshBalance() {
    this.authService.refreshBalance();
  }

  recover() {
    this.dialog.open(WalletRecoverComponent, { width: '500px' });
  }
}
