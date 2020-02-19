import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie';

// @todo(#1952) Implement this logic in a component
const versionColumns = {
  date: 'Date',
  offer: 'Offer Amount',
  status: 'Status'
};

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
  versionColumns = versionColumns;
  initialVersionColumns = ['date', 'offer', 'status'];

  constructor(private query: ContractQuery) { }

  getDirectors(movie: Movie) {
    return  movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
  }
}
