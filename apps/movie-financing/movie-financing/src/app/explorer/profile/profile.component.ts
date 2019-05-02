import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'financing-explorer-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerProfileComponent implements OnInit {

  public user$: Observable<User>;

  constructor(private authQuery: AuthQuery) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
  }

}
