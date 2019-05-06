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
  public notLoading$ = new BehaviorSubject<boolean>(true);

  constructor(private authService: AuthService, private authQuery: AuthQuery) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.network = network ;
  }

  refreshBalance() {
    this.notLoading$.next(false);
    this.authService.refreshBalance();
    setTimeout(() => this.notLoading$.next(true), 600);
  }
}
