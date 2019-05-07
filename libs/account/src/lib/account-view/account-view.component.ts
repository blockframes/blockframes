import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, AuthQuery, AuthService } from '@blockframes/auth';
import { network } from '@env';

@Component({
  selector: 'account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountViewComponent implements OnInit {
  public user$: Observable<User>;
  public explorerUrl: string;
  public isBalanceLoading$: Observable<boolean>;

  constructor(private authService: AuthService, private authQuery: AuthQuery) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.isBalanceLoading$ = this.authQuery.isBalanceLoading$;
    this.explorerUrl = network === 'homestead' as string ? 'https://etherscan.io/address/' : `https://${network}.etherscan.io/address/`;
  }

  refreshBalance() {
    this.authService.refreshBalance();
  }
}
