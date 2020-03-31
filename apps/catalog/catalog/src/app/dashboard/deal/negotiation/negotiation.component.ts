import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent {

  activeVersion$ = this.query.activeVersion$;
  versionView$ = this.query.activeVersionView$;
  titles$ = this.query.titles$;
  payment$ = this.query.activeVersion$.pipe(map(displayPaymentSchedule));
  moviesCount$ = this.movieQuery.selectCount();
  licensees = this.query.getActiveParties('licensee');
  subLicensors$ = this.query.subLicensors$;

  historizedVersionsView$ = this.query.historizedVersionsView$;

  constructor(private query: ContractQuery, private movieQuery: MovieQuery, private intercom: Intercom) { }

  openIntercom() {
    this.intercom.show();
  }
}
