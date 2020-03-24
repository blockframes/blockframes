import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MemberService } from '@blockframes/organization/member/+state/member.service';
import { MemberQuery } from '@blockframes/organization/member/+state/member.query';
import { ViewComponent } from '../view/view.component';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-marketplace-organization-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public members$ = this.query.selectAll();

  constructor(
    private parent: ViewComponent,
    private service: MemberService,
    private query: MemberQuery
  ) { }

  ngOnInit(): void {
    this.sub = this.parent.org$.pipe(
      map(org => org.userIds),
      switchMap(userIds => this.service.syncManyDocs(userIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
