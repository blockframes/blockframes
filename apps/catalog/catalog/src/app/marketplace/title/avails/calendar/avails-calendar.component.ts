
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';


import { MovieQuery } from '@blockframes/movie/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { MarketplaceMovieAvailsComponent } from '../avails.component';


@Component({
  selector: 'catalog-movie-avails-calendar',
  templateUrl: './avails-calendar.component.html',
  styleUrls: ['./avails-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceMovieAvailsCalendarComponent implements OnInit {

  public availsForm = this.shell.avails.calendarForm;

  public org$: Observable<Organization>;

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private shell: MarketplaceMovieAvailsComponent,
  ) { }

  public async ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);
  }

  clear() {
    this.availsForm.reset();
  }
}
