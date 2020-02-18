import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { KeyManagerService, KeyManagerQuery } from "../../../key-manager/+state";
import { WalletQuery } from "../../+state";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { Key } from "../../../types";

enum steps {
  import,
  password,
  end
}

@Component({
  selector: 'wallet-import-key',
  templateUrl: './wallet-import-key.component.html',
  styleUrls: ['./wallet-import-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletImportKeyComponent implements OnInit {

  steps = steps;
  step = this.steps.import;
  mnemonic: string;
  isEncrypting$: Observable<boolean>;

  constructor(
    private router: Router,
    private walletQuery: WalletQuery,
    private keyQuery: KeyManagerQuery,
    private service: KeyManagerService,
  ) {}

  ngOnInit() {
    this.isEncrypting$ = this.keyQuery.selectLoading();
  }

  handleImportKey(key: Key) {
    this.service.storeKey(key);
    this.step = this.steps.end;
  }

  handleImportMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.step = this.steps.password;
  }

  async handlePassword(encryptionPassword: string) {
    const { ensDomain } = this.walletQuery.getValue();
    const keyName = this.service.getDefaultKeyName(ensDomain);
    const key = await this.service.importFromMnemonic(keyName, ensDomain, this.mnemonic, encryptionPassword);
    this.service.storeKey(key);
    this.step = this.steps.end;
  }

  handleRedirection() {
    if (!!this.walletQuery.getValue().tx) {
      this.router.navigateByUrl('/c/o/account/wallet/send');
    } else {
      this.router.navigateByUrl('/c/o/account/wallet');
    }
  }
}
