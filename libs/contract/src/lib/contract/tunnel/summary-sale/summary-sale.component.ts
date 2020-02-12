import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { Observable } from 'rxjs';
import { FormEntity } from '@blockframes/utils';

@Component({
  selector: 'contract-tunnel-summary-sale',
  templateUrl: './summary-sale.component.html',
  styleUrls: ['./summary-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarySaleComponent implements OnInit {

  public movies$: Observable<Movie[]>;
  public dealForms: FormEntity<DealControls>;
  public form: ContractForm;

  constructor(private tunnel: ContractTunnelComponent) { }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.dealForms = this.tunnel.dealForms;
    this.form = this.tunnel.contractForm;
  }
}
