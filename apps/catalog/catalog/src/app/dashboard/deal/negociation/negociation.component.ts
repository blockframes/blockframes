import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { Movie, MovieQuery } from '@blockframes/movie';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-negociation',
  templateUrl: './negociation.component.html',
  styleUrls: ['./negociation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegociationComponent {

  activeVersion$ = this.query.activeVersion$;
  versionView$ = this.query.activeVersionView$;
  titles$ = this.query.titles$;
  payment$ = this.query.activeVersion$.pipe(map(displayPaymentSchedule));
  moviesCount$ = this.movieQuery.selectCount();
  licensees = this.query.getParties('licensee');
  subLicensors$ = this.query.subLicensors$;

  oldVersions$ = this.query.oldVersionsView$;

  constructor(private query: ContractQuery, private movieQuery: MovieQuery, private intercom: Intercom) { }

  getDirectors(movie: Movie) {
    return  movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
  }

  openIntercom() {
    this.intercom.show();
  }
}
