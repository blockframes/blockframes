import { ChangeDetectionStrategy, OnInit, Component } from "@angular/core";
import { Observable } from "rxjs";

import { WalletQuery, WalletService } from "../../+state";
import { KeyManagerService } from "../../../key-manager/+state";
import { Router } from "@angular/router";
import { Wallet, Key } from "../../../types";

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
    public router: Router,
    public service: WalletService,
    public keyService: KeyManagerService,
    public query: WalletQuery
  ) {}

  ngOnInit() {
    this.wallet$ = this.query.select();
    this.isLoading$ = this.query.selectLoading();
  }

  async deleteKey(key: Key) {
    if (key.isLinked || key.isMainKey) {
      await this.service.setDeleteKeyTx(this.query.getValue().address, key);
      this.router.navigateByUrl('/layout/o/account/wallet/send');
    } else {
      this.keyService.deleteKey(key);
    }
  }

  async linkKey(key: Key) {
    if (!key.isMainKey && !key.isLinked) {
      await this.service.setLinkKeyTx(this.query.getValue().address, key);
      this.router.navigateByUrl('/layout/o/account/wallet/send');
    } else {
      console.warn('This key is already linked !'); // TODO BETTER ERROR HANDLING : issue 671
    }
  }
}
