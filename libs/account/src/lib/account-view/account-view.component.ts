import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User, AuthQuery } from '@blockframes/auth';
import { network, baseEnsDomain } from '@env';
import { map, filter } from 'rxjs/operators';
import * as makeBlockie from 'ethereum-blockies-base64';

@Component({
  selector: 'account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountViewComponent implements OnInit, OnDestroy {
  public user$: Observable<User>;
  public asciiUsername$: Observable<string>;
  public blockie$: Observable<string>;
  public network: string;

  constructor( private authQuery: AuthQuery) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.blockie$ = this.user$.pipe(
      filter(user => !!user),
      map(user => makeBlockie.default(user.identity.address))
    );
    this.network = network ;
  }

  ngOnDestroy() {
  }
}
