import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery, User, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'financing-explorer-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerProfileComponent implements OnInit {

  public user$: Observable<User>;

  userRank: string;
  rank = new FormControl();

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.user$ = this.authQuery.user$.pipe(
      tap(user => this.userRank = (!!user.financing && !!user.financing.rank) ? user.financing.rank : 'silver'),
    );
  }

  updateRank() {
    this.authService.changeRank(this.rank.value);
  }
}
