import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { Observable } from 'rxjs';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormControl } from '@angular/forms';
import { ContractVersionPriceControl, ContractVersionForm } from '@blockframes/contract/version/form';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { displayPaymentSchedule, displayTerms } from '../../+state/contract.utils';
import { ContractQuery, ContractService } from '../../+state';

@Component({
  selector: 'contract-tunnel-summary-mandate',
  templateUrl: './summary-mandate.component.html',
  styleUrls: ['./summary-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMandateComponent implements OnInit {

  public movies$: Observable<Movie[]>;
  public lastVersionForm: ContractVersionForm;
  public dealForms: FormEntity<DealControls>;
  public form: ContractForm;
  public parties: { licensee: FormControl[], licensor: { subRole: FormControl, displayName: FormControl }[] };
  public terms: string;
  public price: ContractVersionPriceControl;
  public deals: Record<string, string> = {}
  public currency: MovieCurrenciesSlug;
  public payments: { type: string, list: string[] };

  constructor(
    private tunnel: ContractTunnelComponent,
    private contractService: ContractService,
    private query: ContractQuery
  ) { }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.dealForms = this.tunnel.dealForms;
    this.form = this.tunnel.contractForm;

    this.lastVersionForm = this.form.get('lastVersion');
    // Parties
    this.parties = { licensee: [], licensor: [] };
    for (const party of this.form.get('parties').controls) {
      if (party.value.party.role === 'licensee') {
        this.parties.licensee.push(party.get('party').get('displayName'));
      } else if (party.value.party.role === 'licensor') {
        this.parties.licensor.push({
          displayName: party.get('party').get('displayName'),
          subRole: party.get('childRoles')
        })
      }
    }

    this.terms = displayTerms(this.lastVersionForm.get('scope').value);
    this.price = this.lastVersionForm.get('price').controls;
    this.currency = this.price.currency.value;

    // Distribution fees
    const { price, titles } = this.lastVersionForm.value;
    for (const movieId in titles) {
      if (price.commission && titles[movieId].price.commissionBase) {
        // Common Distribution Fee
        const { commission } = price;
        const { commissionBase } = titles[movieId].price;
        this.deals[movieId] = `${commission} Distribution fee on ${commissionBase}.`;
      } else if (titles[movieId].price.commission && titles[movieId].price.commissionBase) {
        // Title Distribution Fee
        const { commission, commissionBase } = titles[movieId].price;
        this.deals[movieId] = `${commission} Distribution fee on ${commissionBase}.`;
      } else {
        return undefined;
      }
    }

    this.payments = displayPaymentSchedule(this.lastVersionForm.value);
  }

  /**
   * Submit a contract version to Archipel Content
   */
  async submit() {
    const contract = this.query.getActive();
    await this.tunnel.save();
    return this.contractService.submit(contract);
  }
}
