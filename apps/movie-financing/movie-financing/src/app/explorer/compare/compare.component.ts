import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery, User, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'financing-explorer-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerCompareComponent implements OnInit {

  public user$: Observable<User>;
  public isBalanceLoading$: Observable<boolean>;
  public amount: number;

  constructor(private authQuery: AuthQuery, private authService: AuthService) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.isBalanceLoading$ = this.authQuery.isBalanceLoading$;
    this.amount = 0.01;
  }

  handleChange(value) {
    this.amount = value;
  }

  refreshBalance() {
    this.authService.refreshBalance();
  }

  requestTokens() {
    this.authService.requestTokens(this.amount);
  }

}
