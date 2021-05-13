
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { MovieQuery } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService, isMandate } from '@blockframes/contract/contract/+state';
import { DurationMarker, toDurationMarker } from '@blockframes/contract/avails/avails';

import { MarketplaceMovieAvailsComponent } from '../avails.component';

@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements OnInit {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  public durationMarkers: DurationMarker[] = [];

  private terms: Term<Date>[];


  public availableMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // available
  public soldMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // sold
  public inBucketMarkers$ = new BehaviorSubject<DurationMarker[]>([]); // already selected in the bucket

  constructor(
    private movieQuery: MovieQuery,
    private termService: TermService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  async ngOnInit() {

    // retrieve all contracts for the given Movie
    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movieQuery.getActiveId()).where('status', '==', 'accepted'));

    // Filter on retrieved contracts to keep only the contracts of type "mandate"
    const mandates = contracts.filter(isMandate);

    // Retrieve all terms of all contracts and flatten them into a single array
    this.terms = await this.termService.getValue(mandates.map(m => m.termIds).flat());

    this.terms.forEach(term => this.durationMarkers.push(toDurationMarker(mandates, term)));

    // TODO available should be computed from DB & sold & avail filter form
    this.availableMarkers$.next(this.durationMarkers); // TODO REMOVE THAT !
  }

  clear() {
    this.availsForm.reset();
  }
}
