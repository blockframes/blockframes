
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';


import { Observable } from 'rxjs';

import { MovieQuery } from '@blockframes/movie/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';

import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent {

  public availsForm = this.shell.avails.calendarForm;

  public org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  clear() {
    this.availsForm.reset();
  }
}
