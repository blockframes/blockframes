import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { UserService } from '@blockframes/user/+state/user.service';
import { UserQuery } from '@blockframes/user/+state/user.query';
import { ViewComponent } from '../view/view.component';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fade, fadeLsit } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'festival-marketplace-organization-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  animations: [fade, fadeLsit('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit, OnDestroy {
  @HostBinding('@fade') animation = true;

  private sub: Subscription;
  public members$ = this.query.selectAll();


  constructor(
    private parent: ViewComponent,
    private service: UserService,
    private query: UserQuery
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
