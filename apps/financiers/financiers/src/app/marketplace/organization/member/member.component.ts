import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { UserService } from '@blockframes/user/+state/user.service';
import { UserQuery } from '@blockframes/user/+state/user.query';
import { ViewComponent } from '../view/view.component';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fade, fadeList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'financiers-marketplace-organization-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  animations: [fade, fadeList('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit, OnDestroy {
  @HostBinding('@fade') animation = true;

  private sub: Subscription;
  public org$ = this.parent.org$;
  public members$ = this.query.selectAll();


  constructor(
    private parent: ViewComponent,
    private service: UserService,
    private query: UserQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Sales Agent', 'Contact');
    this.sub = this.org$.pipe(
      map(org => org.userIds),
      switchMap(userIds => this.service.syncManyDocs(userIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
