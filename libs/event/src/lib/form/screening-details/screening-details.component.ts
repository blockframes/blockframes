import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { fromOrgAndAccepted, Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, pluck, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'event-screening-details',
  templateUrl: './screening-details.component.html',
  styleUrls: ['./screening-details.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningDetailsComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private formSub: Subscription;
  link: string;
  form: EventForm;
  titles$: Observable<Movie[]>;

  constructor(
    private service: EventService,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
      map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
    );

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
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty());

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }

}
