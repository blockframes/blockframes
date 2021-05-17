
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

import { MovieQuery } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { DurationMarker, toDurationMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public durationMarkers: DurationMarker[] = [];

  private mandateTerms$ = this.shell.mandateTerms$;

  // TODO REMOVE BEHAVIOR-SUBJECT AND COMPUTE FROM TERMS
  public availableMarkers$ = new Observable<DurationMarker[]>(); // available
  public soldMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // sold
  public inBucketMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // already selected in the bucket

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) {

    this.availableMarkers$ = combineLatest([
      this.shell.mandates$,
      this.mandateTerms$,
    ]).pipe(
      map(([mandates, mandateTerms]) => {
        for (const mandateTerm of mandateTerms) {
          this.durationMarkers.push(toDurationMarker(mandates, mandateTerm));
        }

        // TODO available should be computed from DB & sold & avail filter form
        return this.durationMarkers; // TODO REMOVE THAT !
      })
    );

  }

  clear() {
    this.availsForm.reset();
  }
}
