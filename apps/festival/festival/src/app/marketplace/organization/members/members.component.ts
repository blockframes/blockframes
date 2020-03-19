import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-marketplace-organization-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public members$; // this.query.selectAll()

  constructor(
    private parent: ViewComponent
  ) { }

  ngOnInit(): void {
    // this.sub = this.members$ = this.parent.org$.pipe(
    //   map(org => org.userIds),
    //   switchMap(userIds => this.service.syncManyDoc(userIds))
    // ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
