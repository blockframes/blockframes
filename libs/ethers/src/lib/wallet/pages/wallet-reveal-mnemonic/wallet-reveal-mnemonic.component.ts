import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { Wallet as EthersWallet } from "@ethersproject/wallet";
import { ActivatedRoute } from "@angular/router";
import { KeyManagerQuery, KeyManagerService } from "../../../key-manager/+state";
import { Observable } from "rxjs";
import { Key } from "../../../types";

enum steps {
  password,
  end
}

@Component({
  selector: 'wallet-reveal-mnemonic',
  templateUrl: './wallet-reveal-mnemonic.component.html',
  styleUrls: ['./wallet-reveal-mnemonic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletRevealMnemonicComponent implements OnInit {

  steps = steps;
  step = steps.password;
  key: Key;
  activeKey: EthersWallet;
  mnemonic: string;
  isLoading$: Observable<boolean>;
  loadingProgress$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private keyQuery: KeyManagerQuery,
    private keyService: KeyManagerService,
  ) {}

  ngOnInit() {
    this.key = this.keyQuery.getEntity(this.route.snapshot.paramMap.get('address'));
    this.isLoading$ = this.keyQuery.selectLoading();
    this.loadingProgress$ = this.keyQuery.selectProgress();
    this.mnemonic = '';
  }

  async setPassword(password: string) {
    this.step = steps.end;
    const wallet = await this.keyService.unlockKey(this.key, password);
    this.mnemonic = this.keyService.extractMnemonic(wallet);
  }
}
