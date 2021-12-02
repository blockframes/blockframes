import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  private contract?: Contract;
  private income?: Income;
  title?: Movie;
  form = new NegotiationForm();
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'accepted'));
  currency?: string;
  activeTerm?: string;

  constructor(
    private route: ActivatedRoute,
    private service: MovieService,
    private snackbar: MatSnackBar,
    private termService: TermService,
    private titleService: MovieService,
    private offerService: OfferService,
    private incomeService: IncomeService,
    private contractService: ContractService,
  ) { }

  async ngOnInit() {
    const contractId: string = this.route.snapshot.params.contractId;
    const offerId: string = this.route.snapshot.params.offerId;
    const [contract, income, offer] = await Promise.all([
      this.contractService.getValue(contractId),
      this.incomeService.getValue(contractId),
      this.offerService.getValue(offerId)
    ]);
    this.title = await this.titleService.getValue(contract.titleId);
    this.contract = contract;
    this.income = income;
    this.currency = offer?.currency;
    const terms = await this.termService.getValue(contract.termIds);
    this.form.hardReset({
      price: income?.price,
      terms
    });
    this.activeTerm = this.route.snapshot.queryParams.termId;
  }

  async save() {
    if (this.form.valid) {
      const { terms, price } = this.form.value;
      const contractId = this.route.snapshot.params.contractId;
      const write = this.contractService.batch(); // create a batch
      const termList = terms.map(term => ({...term, contractId}));
      const termIds = await this.termService.upsert(termList, { write });
      const existingTermIds = this.contract?.termIds || [];
      const termIdsToDelete = existingTermIds.filter(id => !termIds.includes(id));
      await this.termService.remove(termIdsToDelete, { write });
      await this.contractService.update(contractId, { termIds }, { write });
      if (price !== this.income?.price) {
        await this.incomeService.update(contractId, { price }, { write });
      }

      await write.commit();
      this.snackbar.open('Contract updated!', 'ok', { duration: 1000 });
    }
  }
}
