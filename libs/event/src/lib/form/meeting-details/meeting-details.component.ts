import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { User } from '@blockframes/auth/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { RouterQuery } from '@datorama/akita-ng-router-store';
@Component({
  selector: 'event-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingDetailsComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private formSub: Subscription;
  link: string;
  form: EventForm;

  members$: Observable<User[]>;

  constructor(
    private service: EventService,
    private userService: UserService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Meeting info');
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.members$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.userService.valueChanges(org.userIds))
    )

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {
      const app = getCurrentApp(this.routerQuery);
      const url = applicationUrl[app];

      const place = event.type === 'meeting' ? 'lobby' : 'session';
      this.link = `${url}/c/o/marketplace/event/${event.id}/${place}`;

      this.form = new EventForm(event);

      // FormArray (used in FormList) does not mark as dirty on push,
      // so we do it manually to enable the save button
      // more info : https://github.com/angular/angular/issues/16370
      if (this.formSub) {
        this.formSub.unsubscribe();
        delete this.formSub;
      }
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty()); // @TODO #5895 remove all formSub ?

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }


}
