import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { Invitation } from '@blockframes/invitation/+state';

@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  form = new EventForm({ type: 'screening' });  // force the screening type to have default meta fields
  titles$: Observable<Movie[]>;
  invitations$: Observable<Invitation[]>;

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(
    private query: EventQuery,
    private movieService: MovieService,
    private invitationService: InvitationService,
    private orgQuery: OrganizationQuery,
  ) { }

  ngOnInit(): void {
    this.invitations$ = this.query.selectActiveId().pipe(
      switchMap(id => this.invitationService.valueChanges(ref => ref.where('docId', '==', id).limit(10))),
      startWith([])
    );
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.getValue(org.movieIds))
    );
    this.sub = this.query.selectActive().subscribe(event => this.form.reset(event));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get meta() {
    return this.form.get('meta');
  }
}
