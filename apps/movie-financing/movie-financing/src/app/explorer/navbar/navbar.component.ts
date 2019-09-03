import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'financing-explorer-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerNavbarComponent implements OnInit {

  userRank: string;
  user$: Observable<User>

  constructor(
    private query: AuthQuery,
  ) {}

  ngOnInit() {
    this.user$ = this.query.user$.pipe(
      tap(user => this.userRank = (!!user.financing && !!user.financing.rank) ? user.financing.rank : 'silver'),
    );
  }
}
