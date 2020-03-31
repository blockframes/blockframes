import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractVersionPriceControl } from '@blockframes/contract/version/form';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { DistributionDealService } from '@blockframes/distribution-deals/+state';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { ContractQuery, ContractService } from '../../+state';
import { displayPaymentSchedule, displayTerms } from '../../+state/contract.utils';
import { Observable } from 'rxjs';

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
  public terms: string;
  public price: ContractVersionPriceControl;
  public moviePrices: Record<string, FormControl> = {}
  public currency: MovieCurrenciesSlug;
  public payments: { type: string, list: string[] } = { type: '', list: [] };

  constructor(
    private tunnel: ContractTunnelComponent,
    private db: AngularFirestore,
    private contractService: ContractService,
    private dealService: DistributionDealService,
    private query: ContractQuery,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Contract offer summary', 'Summary and Submit')
  }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.dealForms = this.tunnel.dealForms;
    this.form = this.tunnel.contractForm;

    const lastVersion = this.form.get('lastVersion');

    this.parties = {
      licensee: this.getParties('licensee'),
      licensor: this.getParties('licensor')
    };
    this.terms = displayTerms(lastVersion.get('scope').value);
    this.price = lastVersion.get('price').controls;
    this.currency = this.price.currency.value;
    for (const movieId in lastVersion.get('titles').controls) {
      this.moviePrices[movieId] = lastVersion.get('titles').get(movieId).get('price').get('amount');
    }

    this.payments = displayPaymentSchedule(lastVersion.value);
  }

  private getParties(role: 'licensee' | 'licensor') {
    const parties = this.form.get('parties').controls.filter(({ value }) => value.party.role === role);
    return parties.map(p => p.get('party').get('displayName'));
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
