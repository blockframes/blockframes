import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { PersistNgFormPlugin } from '@datorama/akita';
import { Observable } from 'rxjs';
import { User, AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountViewComponent implements OnInit, OnDestroy {
  public user$: Observable<User>;

  constructor( private authQuery: AuthQuery) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$();
  }

  ngOnDestroy() {
  }
}
