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
  public network: string;
  public isBalanceLoading$: Observable<boolean>;

  constructor(private authService: AuthService, private authQuery: AuthQuery) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.isBalanceLoading$ = this.authQuery.isBalanceLoading$;
    this.network = network ;
  }

  refreshBalance() {
    this.authService.refreshBalance();
  }
}
