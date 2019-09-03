import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService, Invitation } from '../+state';
import { Order } from '@datorama/akita';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public invitations$: Observable<Invitation[]>;
  private destroyed$ = new Subject();

  constructor(private query: InvitationQuery, private service: InvitationService) {}

  ngOnInit() {
    this.invitations$ = this.query.selectAll({
      filterBy: entity => entity.state === 'pending',
      sortBy: 'date',
      sortByOrder: Order.DESC
    });
    this.service.organizationInvitations$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
