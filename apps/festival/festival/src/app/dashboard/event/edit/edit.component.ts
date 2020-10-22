import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventForm, MeetingForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { User } from '@blockframes/auth/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, pluck, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [slideUpList('h2, mat-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private formSub: Subscription;
  form: EventForm;
  titles$: Observable<Movie[]>;
  invitations$: Observable<Invitation[]>;
  members$: Observable<User[]>;
  type: EventTypes;

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(
    private service: EventService,
    private movieService: MovieService,
    private invitationService: InvitationService,
    private userService: UserService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.invitations$ = eventId$.pipe(
      switchMap((eventId) => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('docId', '==', eventId)))
    );

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      // org.movieIds also includes movies from the catalog app but please keep it this way. This way Marie can create events for movies that are only on catalog too.
      switchMap(org => this.movieService.getValue(org.movieIds)),
      map(titles => titles.filter(title => title.storeConfig.status === 'accepted' || 'submitted')),
    );

    this.members$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.userService.valueChanges(org.userIds))
    )

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {
      this.type = event.type;
      this.form = new EventForm(event);

      // FormArray (used in FormList) does not mark as dirty on push,
      // so we do it manually to enable the save button
      // more info : https://github.com/angular/angular/issues/16370
      if (!!this.formSub) {
        this.formSub.unsubscribe();
        delete this.formSub;
      }
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty());

      this.cdr.markForCheck();
    });
  }

  // Will be used to show event statistics only if event started
  isEventStarted() {
    const start = this.form.get('start').value as Date;
    return start.getTime() < Date.now();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }

  get files() {
    return (this.form.meta as MeetingForm).get('files');
  }
}
