import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent {
  panelOpenState: boolean;
  activeVersion$ = this.query.activeVersion$;
  versionView$ = this.query.activeVersionView$;
  titles$ = this.query.titles$;
  payment$ = this.query.activeVersion$.pipe(map(displayPaymentSchedule));

  versionsView$ = this.query.versionsView$;

  constructor(
    @Optional() private intercom: Intercom,
    private query: ContractQuery,
  ) { }

  getDirectors(movie: Movie) {
    return  movie.main.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
  }

  openIntercom() {
    this.intercom.show();
  }
}
