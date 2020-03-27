import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
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

  oldVersions$ = this.query.oldVersionsView$;

  constructor(private query: ContractQuery, private intercom: Intercom) { }

  getDirectors(movie: Movie) {
    return  movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
  }

  openIntercom() {
    this.intercom.show();
  }
}
