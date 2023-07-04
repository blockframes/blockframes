import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  Expense,
  Income,
  Movie,
  PricePerCurrency,
  Term,
  Territory,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallSource,
  convertDocumentTo,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  getDeclaredAmount,
  isContract
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { TermService } from '@blockframes/contract/term/service';

@Component({
  selector: 'crm-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public documents: WaterfallDocument[] = [];
  public incomes: Income[] = [];
  public expenses: Expense[] = [];
  public sources: WaterfallSource[] = [];
  public contracts: WaterfallContract[] = [];
  private terms: Term[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfalllDocumentService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private termService: TermService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = await this.waterfallService.getValue(waterfallId);
    this.sources = this.waterfall.sources;
    this.documents = await this.waterfalllDocumentService.getValue({ waterfallId });

    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.terms = (await Promise.all(this.contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    this.incomes = await this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.expenses = await this.expenseService.getValue([where('titleId', '==', this.waterfall.id)]);

    this.cdRef.markForCheck();
  }

  public goToDocument(id: string) {
    //this.router.navigate([id, 'map'], { relativeTo: this.route });
  }

  public getAssociatedSource(income: Income) {
    return getAssociatedSource(income, this.waterfall.sources).name;
  }

  public getCurrentContract(item: Income | Expense) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedTermsComponent, {
      data: createModalData({ terms: territories, scope: 'territories' }),
      autoFocus: false
    });
  }

  public getDeclaredAmount(contract: WaterfallContract) {
    return getDeclaredAmount({ ...contract, terms: this.terms.filter(t => t.contractId === contract.id) });
  }

  public getPrice(item: Income | Expense): PricePerCurrency {
    return { [item.currency]: item.price };
  }
}
