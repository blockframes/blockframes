import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie';
import { ContractTunnelComponent, DealControls } from '../contract-tunnel.component';
import { Observable } from 'rxjs';
import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { ContractVersionPriceControl, ContractVersionForm } from '@blockframes/contract/version/form';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { displayPaymentSchedule, displayTerms } from '../utils';
import { ContractQuery, ContractStatus, ContractService } from '../../+state';
import { ContractVersionService } from '@blockframes/contract/version/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { DistributionDealStatus } from '@blockframes/movie/distribution-deals/+state/distribution-deal.firestore';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';

@Component({
  selector: 'contract-tunnel-summary-mandate',
  templateUrl: './summary-mandate.component.html',
  styleUrls: ['./summary-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMandateComponent implements OnInit {

  public movies$: Observable<Movie[]>;
  public version: ContractVersionForm;
  public dealForms: FormEntity<DealControls>;
  public form: ContractForm;
  public parties: { licensee: FormControl[], licensor: { subRole: FormControl, displayName: FormControl}[] };
  public terms: string;
  public price: ContractVersionPriceControl;
  public deals: Record<string, string> = {}
  public currency: MovieCurrenciesSlug;
  public payments: { type: string, list: string[] };

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
    this.version = this.form.get('versions').last();
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

    this.terms = displayTerms(this.version.get('scope').value);
    this.price = this.version.get('price').controls;
    this.currency = this.price.currency.value;

    // Distribution fees
    const { price, titles } = this.version.value;
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

    this.payments = displayPaymentSchedule(this.version.value);
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
