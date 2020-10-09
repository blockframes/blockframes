import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '../../form/contract.form';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { ContractTunnelComponent, RightControls } from '../contract-tunnel.component';
import { Observable } from 'rxjs';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormControl } from '@angular/forms';
import { PriceControl, ContractVersionForm } from '@blockframes/contract/version/form';
import { MovieCurrencies } from '@blockframes/utils/static-model';
import { displayPaymentSchedule, displayTerms } from '../../+state/contract.utils';
import { ContractQuery, ContractService } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'contract-tunnel-summary-mandate',
  templateUrl: './summary-mandate.component.html',
  styleUrls: ['./summary-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMandateComponent implements OnInit {

  public movies$: Observable<Movie[]>;
  public lastVersionForm: ContractVersionForm;
  public rightForms: FormEntity<RightControls>;
  public form: ContractForm;
  public parties: { licensee: FormControl[], licensor: { subRole: FormControl, displayName: FormControl }[] };
  public terms: string;
  public price: PriceControl;
  public rights: Record<string, string> = {}
  public currency: MovieCurrencies;
  public payments: { type: string, list: string[] };

  constructor(
    private tunnel: ContractTunnelComponent,
    private contractService: ContractService,
    private query: ContractQuery,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dynTitle.setPageTitle('Contract offer summary', 'Summary and Submit')
  }

  ngOnInit() {
    // Need to create it in the ngOnInit or it's not updated
    this.movies$ = this.tunnel.movies$;
    this.rightForms = this.tunnel.rightForms;
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
        this.rights[movieId] = `${commission} Distribution fee on ${commissionBase}.`;
      } else if (titles[movieId].price.commission && titles[movieId].price.commissionBase) {
        // Title Distribution Fee
        const { commission, commissionBase } = titles[movieId].price;
        this.rights[movieId] = `${commission} Distribution fee on ${commissionBase}.`;
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
    try {
      await this.tunnel.save();
      await this.contractService.submit(this.form.value);
    } catch (error) {
      console.error(error)
    }
    this.router.navigate(['success'], { relativeTo: this.route })
  }
}
