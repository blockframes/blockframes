import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { fromOrgAndAccepted, Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'event-screening',
  templateUrl: './screening.component.html',
  styleUrls: ['./screening.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check Antoine
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningComponent implements OnInit {

  titles$: Observable<Movie[]>;

  constructor(
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
      map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
    );
  }


}
