import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountProfileComponent implements OnInit, OnDestroy {

  public user$: Observable<User>;

  constructor(private authQuery: AuthQuery,) {
  }

  async ngOnInit() {
    this.user$ = this.authQuery.user$();
  }

  ngOnDestroy() {
  }
}
