import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie';
import { FormEntity } from '@blockframes/utils';
import { ContractVersionPriceControl } from '@blockframes/contract/version/form';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { ContractVersionService } from '@blockframes/contract/version/+state';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { DistributionDealStatus } from '@blockframes/movie/distribution-deals/+state/distribution-deal.firestore';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { ContractQuery, ContractStatus } from '../../+state';
import { displayPaymentSchedule, displayTerms } from '../utils';
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
    private service: ContractVersionService,
    private dealService: DistributionDealService,
    private query: ContractQuery
  ) { }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.dealForms = this.tunnel.dealForms;
    this.form = this.tunnel.contractForm;
    const lastVersion = this.form.get('versions').last();

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
   * @todo(#1887) should update the version on the contract
   * @note cannot put this function on the service or you hit cyrcular dependancies
   */
  async submit() {
    const lastIndex = this.form.get('versions').value.length - 1;
    const contractId = this.query.getActiveId();

    // Make sure everything is saved first and that deals have ids
    await this.tunnel.save();
    const write = this.db.firestore.batch();
    this.service.update(`${lastIndex}`, { status: ContractStatus.submitted }, { params: { contractId }, write });
    
    for (const movieId in this.dealForms.value) {
      const undernegotiation = { status: DistributionDealStatus.undernegotiation };
      const dealIds = this.dealForms.get(movieId).value.map(deal => deal.id);
      this.dealService.update(dealIds, undernegotiation, { params: { movieId }, write });
    }
    return write.commit();
  }
}
