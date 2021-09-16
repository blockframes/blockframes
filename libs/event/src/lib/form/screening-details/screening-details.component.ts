import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { fromOrgAndAccepted, Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';

@Component({
  selector: 'event-screening-details',
  templateUrl: './screening-details.component.html',
  styleUrls: ['./screening-details.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningDetailsComponent implements OnInit {

  titles$: Observable<Movie[]>;

  constructor(
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private shell: EventEditComponent,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  // @TODO #5895 supprimer les -details des componenents

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
      map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
    );
  }


}
