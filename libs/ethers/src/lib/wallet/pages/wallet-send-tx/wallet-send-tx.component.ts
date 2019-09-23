import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { WalletQuery, WalletService } from "../../+state";
import { Observable, BehaviorSubject } from "rxjs";
import { KeyManagerQuery, KeyManagerService } from "../../../key-manager/+state";
import { Wallet as EthersWallet } from "@ethersproject/wallet";
import { Router } from "@angular/router";
import { Wallet } from "../../../types";
import { Key } from "@blockframes/utils";

enum steps {
  select,
  password,
  confirm,
  end
}

@Component({
  selector: 'wallet-send-tx',
  templateUrl: './wallet-send-tx.component.html',
  styleUrls: ['./wallet-send-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletSendTxTunnelComponent implements OnInit {

  steps = steps;
  step = this.steps.select;
  key: Key;
  activeKey: EthersWallet;
  wallet$: Observable<Wallet>;
  isDecrypting$: Observable<boolean>;
  isDeploying$ = new BehaviorSubject(false);
  isPending$ = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private query: WalletQuery,
    private walletService: WalletService,
    private keyManagerQuery: KeyManagerQuery,
    private keyManagerService: KeyManagerService,
  ){}

  ngOnInit(){
    this.wallet$ = this.query.select();
    this.isDecrypting$ = this.keyManagerQuery.selectLoading();
  }

  handleKeySelection(key: Key) {
    this.key = key;
    this.step = this.steps.password;
  }

  async setPassword(password: string) {
    this.step = this.steps.confirm;
    try {
      this.activeKey = await this.keyManagerService.unlockKey(this.key, password);

      if (!this.query.getValue().hasERC1077) { // we have to wait for password decryption to prevent deploying if the user entered a wrong password
        this.isDeploying$.next(true);
        await this.walletService.deployERC1077(this.key.ensDomain, this.key.address);
        this.isDeploying$.next(false);
      }
    } catch (err) { // TODO better error handling issue#671
      console.warn('Oooops', err);
      this.isDeploying$.next(false);
      this.step = this.steps.end;
    }
  }

  async handleConfirmation() {
    if (!this.query.getValue().hasERC1077) {
      throw new Error('Your smart-wallet is not yet deployed');
    }
    this.step = this.steps.end;
    try {
      this.isPending$.next(true);
      const signedMetaTx = await this.walletService.prepareMetaTx(this.activeKey);
      await this.walletService.sendSignedMetaTx(this.key.ensDomain, signedMetaTx); // await to ensure tx has been mined (tx failure will throw)
      this.isPending$.next(false);
    } catch(err) {
      console.warn('Ooops', err); // TODO better error handling issue#671
      this.isPending$.next(false);
    }
  }

  handleRedirect(route: string) {
    this.walletService.deleteTxFeedback();
    this.router.navigateByUrl(route);
  }
}
