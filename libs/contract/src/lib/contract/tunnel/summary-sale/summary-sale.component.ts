import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { Observable } from 'rxjs';
import { FormEntity, TemporalityUnit } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { DistributionDealTermsControl } from '@blockframes/movie/distribution-deals/form/terms/terms.form';
import { ContractVersionPriceControl, ContractVersionPriceForm } from '@blockframes/contract/version/form';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { ContractVersion } from '@blockframes/contract/version/+state';

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
  public parties: { licensee: FormControl[], licensor: FormControl[] };
  public terms: DistributionDealTermsControl;
  public price: ContractVersionPriceControl;
  public moviePrices: Record<string, FormControl> = {}
  public currency: MovieCurrenciesSlug;
  public payments: string[];

  constructor(private tunnel: ContractTunnelComponent) { }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.dealForms = this.tunnel.dealForms;
    this.form = this.tunnel.contractForm;
    const lastVersion = this.form.get('versions').last();

    this.parties = {
      licensee: this.getParties('licensor'),
      licensor: this.getParties('licensee')
    };
    this.terms = lastVersion.get('scope').controls;
    this.price = lastVersion.get('price').controls;
    this.currency = this.price.currency.value;
    for (const movieId in lastVersion.get('titles').controls) {
      this.moviePrices[movieId] = lastVersion.get('titles').get(movieId).get('price').get('amount');
    }

    // Payment Schedule
    if (lastVersion.get('customPaymentSchedule')) {
      this.payments = [lastVersion.get('customPaymentSchedule').value]
    } else if (this.isPeriodicPayment(lastVersion.value)) {
      this.payments = lastVersion.get('paymentSchedule').value.map(({ percentage, date }) => {
        const { temporality, duration, unit } = date.floatingDuration;
        const { start, floatingStart } = date;
        return `${percentage} ${temporality} ${duration} ${unit} starting from (${start} | ${floatingStart})`
      });
    } else {
      const payments = lastVersion.get('paymentSchedule').value;
      this.payments = payments.map(({ percentage, date }, i) => {
        return `${percentage} upon ${date.floatingStart} | ${payments[i+1].percentage} upon ${payments[i+1].date.floatingStart}`
      });
    }
  }

  private getParties(role: 'licensee' | 'licensor') {
    const parties = this.form.get('parties').controls.filter(({ value }) => value.party.role === role);
    return parties.map(p => p.get('party').get('displayName'));
  }

  private isPeriodicPayment(version: ContractVersion) {
    return version.paymentSchedule[0]
      ? version.paymentSchedule[0].date.floatingDuration.temporality === TemporalityUnit.every
      : false;
  }
}
