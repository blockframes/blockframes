import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { displayPaymentSchedule } from '@blockframes/contract/contract/+state/contract.utils';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';

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
  licensees = this.query.getActiveParties('licensee');
  subLicensors$ = this.query.subLicensors$;

  oldVersions$ = this.query.oldVersionsView$;

  constructor(private query: ContractQuery, private movieQuery: MovieQuery, private intercom: Intercom) { }

  openIntercom() {
    this.intercom.show();
  }
}
