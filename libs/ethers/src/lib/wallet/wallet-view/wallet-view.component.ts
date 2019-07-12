import { ChangeDetectionStrategy, OnInit, Component } from "@angular/core";
import { Observable } from "rxjs";

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
  ensName$: Observable<string>;

  constructor(
    public service: WalletService,
    public query: WalletQuery
  ) {}

  ngOnInit() {
    this.wallet$ = this.query.select();
    this.isLoading$ = this.query.selectLoading();
    this.ensName$ = this.query.select('ensDomain')
  }

  // TODO implment this function : issue 544
  importKey() {
    console.warn('NOT IMPLEMENTED');
  }

  // TODO implment this function : issue 542
  deleteKey(key: Key) {
    console.warn('NOT IMPLEMENTED');
  }
}
