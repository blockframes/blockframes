import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { MovieQuery, Movie } from '@blockframes/movie';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'contract-tunnel-summary-sale',
  templateUrl: './summary-sale.component.html',
  styleUrls: ['./summary-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarySaleComponent {

  movies$ = this.tunnel.movies$;
  dealForms = this.tunnel.dealForms;
  form = this.tunnel.contractForm;

  constructor(private tunnel: ContractTunnelComponent) { }


}
