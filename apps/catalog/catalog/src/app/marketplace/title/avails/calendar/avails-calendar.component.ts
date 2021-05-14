
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';

import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { DurationMarker, toDurationMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';

@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements OnDestroy {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public durationMarkers: DurationMarker[] = [];

  private mandateTerms$ = this.shell.mandateTerms$;

  private sub: Subscription;

  // TODO REMOVE BEHAVIOR-SUBJECT AND COMPUTE FROM TERMS
  public availableMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // available
  public soldMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // sold
  public inBucketMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // already selected in the bucket

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) {

    this.sub = combineLatest([
      this.shell.mandates$,
      this.mandateTerms$,
    ]).subscribe(([mandates, mandateTerms]) => {
      for (const mandateTerm of mandateTerms) {
        this.durationMarkers.push(toDurationMarker(mandates, mandateTerm));
      }

      // TODO available should be computed from DB & sold & avail filter form
    this.availableMarkers$.next(this.durationMarkers); // TODO REMOVE THAT !
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  clear() {
    this.availsForm.reset();
  }
}
