import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(
    private query: EventQuery,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery
  ) { }

  ngOnInit(): void {
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
