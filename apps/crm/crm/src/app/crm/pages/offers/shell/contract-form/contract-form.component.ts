import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { Movie, MovieService } from "@blockframes/movie/+state";
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { TermService } from "@blockframes/contract/term/+state";
import { OfferService } from '@blockframes/contract/offer/+state';

// Forms
import { NegotiationForm } from '@blockframes/contract/negotiation/form'

// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, first } from 'rxjs/operators';
import { joinWith } from '@blockframes/utils/operators';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  private contract?: Contract;
  private negotiation: Negotiation;
  private income?: Income;
  title?: Movie;
  form = new NegotiationForm();
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'accepted'));
  currency?: string;
  activeTerm?: string;
  contractId: string = this.route.snapshot.params.contractId;
  offerId: string = this.route.snapshot.params.offerId;

  private contracts$ = this.contractService.valueChanges(this.contractId).pipe(
    joinWith({
      negotiation: () => this.contractService.adminLastNegotiation(this.contractId)
    }),
    filter(contract => !!contract.negotiation)
  );

  constructor(
    private route: ActivatedRoute,
    private service: MovieService,
    private snackbar: MatSnackBar,
    private termService: TermService,
    private titleService: MovieService,
    private offerService: OfferService,
    private incomeService: IncomeService,
    private contractService: ContractService,
    private negotiationService: NegotiationService,
  ) { }

  async ngOnInit() {
    const [contract, income, offer] = await Promise.all([
      this.contracts$.pipe(first()).toPromise(),
      this.incomeService.getValue(this.contractId),
      this.offerService.getValue(this.offerId)
    ]);
    this.title = await this.titleService.getValue(contract.titleId);
    this.contract = contract;
    this.negotiation = contract.negotiation;
    this.income = income;
    this.currency = offer?.currency;
    this.form.hardReset({
      price: contract.negotiation.price,
      terms: contract.negotiation.terms
    });
    this.activeTerm = this.route.snapshot.queryParams.termIndex;
  }

  async save() {
    if (this.form.valid) {
      const { terms, price } = this.form.value;
      const contractId = this.route.snapshot.params.contractId;
      const write = this.contractService.batch(); // create a batch

      if (this.negotiation.status === 'accepted') {
        const termList = terms.map(term => ({ ...term, contractId }));
        const termIds = await this.termService.upsert(termList, { write });
        const existingTermIds = this.contract?.termIds || [];
        const termIdsToDelete = existingTermIds.filter(id => !termIds.includes(id));
        await this.termService.remove(termIdsToDelete, { write });
        await this.contractService.update(contractId, { termIds }, { write });
        if (price !== this.income?.price) {
          await this.incomeService.update(contractId, { price }, { write });
        }
      }

      const data: Partial<Negotiation> = { terms, price };
      const config = { write, params: { contractId } };
      this.negotiationService.update(this.negotiation.id, data, config)

      await write.commit();
      this.snackbar.open('Contract updated!', 'ok', { duration: 1000 });
    }
  }
}
