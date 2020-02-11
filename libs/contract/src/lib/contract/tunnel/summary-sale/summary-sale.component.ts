import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { MovieQuery } from '@blockframes/movie';
import { ContractTitleDetailForm } from '@blockframes/contract/version/form';

@Component({
  selector: 'contract-tunnel-summary-sale',
  templateUrl: './summary-sale.component.html',
  styleUrls: ['./summary-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarySaleComponent implements OnInit {

  movies$ = this.movieQuery.selectAll();

  constructor(
    private form: ContractForm,
    private movieQuery: MovieQuery
  ) { }

  ngOnInit() {

  }

}
