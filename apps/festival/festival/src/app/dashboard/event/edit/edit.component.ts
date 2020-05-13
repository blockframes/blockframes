import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [slideUpList('h2, mat-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  loading$ = new BehaviorSubject(true);
  form: EventForm;
  titles$: Observable<Movie[]>;
  invitations$: Observable<Invitation[]>;
  type: EventTypes;

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(
    private service: EventService,
    private movieService: MovieService,
    private invitationService: InvitationService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.invitations$ = eventId$.pipe(
      switchMap((eventId) => this.invitationService.valueChanges(ref => ref.where('docId', '==', eventId)))
    );
      
    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.getValue(org.movieIds))
    );

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {
      this.type = event.type;
      this.form = new EventForm(event);
      this.loading$.next(false);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get meta() {
    return this.form.get('meta');
  }
}
