import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { where } from 'firebase/firestore';
import { joinWith } from 'ngfire';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

// Services
import { MovieService } from '@blockframes/movie/service';
import { Contract, Income, Movie, Negotiation } from '@blockframes/model';
import { IncomeService } from '@blockframes/contract/income/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { NegotiationService } from '@blockframes/contract/negotiation/service';

// Forms
import { NegotiationForm } from '@blockframes/contract/negotiation/form';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractFormComponent implements OnInit {
  private contract?: Contract;
  private negotiation: Negotiation;
  private income?: Income;
  title?: Movie;
  form = new NegotiationForm();
  titles$ = this.titleService.valueChanges([where('app.catalog.status', '==', 'accepted')]);
  currency?: string;
  activeTerm?: string;
  contractId: string = this.route.snapshot.params.contractId;
  offerId: string = this.route.snapshot.params.offerId;

  private contracts$ = this.contractService.valueChanges(this.contractId).pipe(
    joinWith({
      negotiation: () => this.contractService.adminLastNegotiation(this.contractId),
    }),
    filter((contract) => !!contract.negotiation)
  );

  constructor(
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private termService: TermService,
    private titleService: MovieService,
    private offerService: OfferService,
    private incomeService: IncomeService,
    private contractService: ContractService,
    private negotiationService: NegotiationService
  ) { }

  async ngOnInit() {
    const [contract, income, offer] = await Promise.all([
      firstValueFrom(this.contracts$),
      this.incomeService.getValue(this.contractId),
      this.offerService.getValue(this.offerId),
    ]);
    this.title = await this.titleService.getValue(contract.titleId);
    this.contract = contract;
    this.negotiation = contract.negotiation;
    this.income = income;
    this.currency = offer?.currency;
    this.form.hardReset({
      price: contract.negotiation.price,
      terms: contract.negotiation.terms,
    });
    this.activeTerm = this.route.snapshot.queryParams.termIndex;
  }

  async save() {
    if (this.form.invalid) return;
    const { terms, price } = this.form.value;
    const contractId = this.route.snapshot.params.contractId;
    const write = this.contractService.batch(); // create a batch

    if (this.negotiation.status === 'accepted') {
      const termList = terms.map((term) => ({ ...term, contractId }));
      const termIds = await this.termService.upsert(termList, { write });
      const existingTermIds = this.contract?.termIds || [];
      const termIdsToDelete = existingTermIds.filter((id) => !termIds.includes(id));
      const promises = [
        this.termService.remove(termIdsToDelete, { write }),
        this.contractService.update(contractId, { termIds }, { write })
      ];
      if (price !== this.income?.price) {
        promises.push(
          this.incomeService.update(contractId, { price }, { write })
        );
      }
      await Promise.all(promises);
    }

    const data: Partial<Negotiation> = { terms, price };
    const config = { write, params: { contractId } };
    await this.negotiationService.update(this.negotiation.id, data, config);

    await write.commit();
    this.snackbar.open('Contract updated!', 'ok', { duration: 1000 });
  }
}
