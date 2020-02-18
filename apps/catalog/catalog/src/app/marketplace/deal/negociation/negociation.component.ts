import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, displayPaymentSchedule } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-negociation',
  templateUrl: './negociation.component.html',
  styleUrls: ['./negociation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegociationComponent implements OnInit {

  versionView$ = this.query.activeVersionView$;
  titles$ = this.query.titles$;
  payment$ = this.query.activeVersion$.pipe(map(displayPaymentSchedule));

  constructor(private query: ContractQuery) { }

  ngOnInit() {
  }

}
