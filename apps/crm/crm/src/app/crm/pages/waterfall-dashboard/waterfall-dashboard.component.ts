import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Block,
  History,
  IncomeState,
  Movie,
  PricePerCurrency,
  Statement,
  Version,
  Waterfall,
  WaterfallContract,
  convertDocumentTo,
  createDuration,
  createProducerStatement,
  getContractAndAmendments,
  getCurrentContract,
  isContract,
  mainCurrency
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { add } from 'date-fns';
import { where } from 'firebase/firestore';

@Component({
  selector: 'crm-waterfall-dashboard',
  templateUrl: './waterfall-dashboard.component.html',
  styleUrls: ['./waterfall-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallDashboardComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public version: Version;
  public blocks: Block[];
  public history: History[];
  private statements: Statement[];
  public pendingStatements: Statement[] = [];
  public contracts: WaterfallContract[] = [];

  public currentState: History;
  public currentBlock: string;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private blockService: BlockService,
    private statementService: StatementService,
    private waterfallDocumentService: WaterfallDocumentsService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const versionId = this.route.snapshot.paramMap.get('versionId');
    const [movie, waterfall, statements, contracts] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.statementService.getValue({ waterfallId }),
      this.waterfallDocumentService.getValue([where('type', '==', 'contract')], { waterfallId }),
    ]);
    this.movie = movie;
    this.waterfall = waterfall;
    this.statements = statements;
    this.contracts = contracts.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    const data = await this.waterfallService.buildWaterfall({ waterfallId, versionId });
    this.history = data.waterfall.history;
    this.version = data.version;
    this.blocks = await this.blockService.getValue(this.version.blockIds, { waterfallId });
    this.currentBlock = this.blocks[this.blocks.length - 1].id;
    this.selectBlock(this.currentBlock);

    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });

    this.cdRef.markForCheck();
  }

  public selectBlock(blockId: string) {
    const index = this.version.blockIds.indexOf(blockId);
    this.currentState = this.history[index + 1]; // First history entry is always empty (init)
    this.pendingStatements = [];
    this.cdRef.markForCheck();
  }

  public getTotalIncomes(incomeState: Record<string, IncomeState>): PricePerCurrency {
    const incomeStates = Object.values(incomeState);
    if (!incomeStates.length) return this.getPrice(0);
    return this.getPrice(incomeStates.map(a => a.amount).reduce((a, b) => a + b));
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getCurrentContract(item: Statement) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.duration.from);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public getPendingRevenue(id: string): PricePerCurrency {
    const pendingRevenue = this.statements.map(s => s.payments.external.filter(p => p.to === id && p.status === 'pending')).flat();

    const pending: PricePerCurrency = {};
    pendingRevenue.forEach(i => {
      pending[i.currency] ||= 0;
      pending[i.currency] += i.price;
    });
    return pending;
  }

  public statementsToCreate(id: string) {
    const statements = this.statements.filter(s => s.payments.external.find(p => p.to === id && p.status === 'received'));

    // TODO #9493 optimize parentPayments & parentIncomes (link between payments rights/incomes and rights linked to contracts) => need a method isRightParentOf() ?
    const parentPayments = statements.map(s => s.payments.external.filter(p => p.to === id && p.status === 'received').map(p => ({ statementId: s.id, paymentId: p.id }))).flat(); 
    const incomeIds = Array.from(new Set(statements.map(s => s.payments.external.filter(p => p.to === id && p.status === 'received').map(p => p.incomeIds).flat()).flat()));

    if (!statements.length) return [];

    const contracts = this.contracts.filter(c => (c.buyerId === id || c.sellerId === id) && !statements.find(s => s.contractId === c.id));

    const roles = this.waterfall.rightholders.find(r => r.id === id)?.roles;
    if (roles.length === 0 || roles.length > 1) {
      this.snackBar.open(`Could not determine statement type for "${this.getRightholderName(id)}"`, 'close', { duration: 5000 });
      // TODO #9493 handle multpile roles to create statements
      return [];
    }

    switch (roles[0]) {
      case 'producer':
        return contracts.map(c => createProducerStatement({
          contractId: c.id,
          rightholderId: id,
          waterfallId: this.waterfall.id,
          parentPayments,
          incomeIds, 
          duration: createDuration({
            from: add(new Date(this.currentState.date), { months: 6 }), // TODO #9493 get periodicity from waterfall document
            to: add(new Date(this.currentState.date), { months: 12 }),
          })
        }));

      default:
        // TODO #9493 handle other roles
        return []
    }
  }

  public displayStatementsToCreate(id: string) {
    this.pendingStatements = this.statementsToCreate(id);
    this.cdRef.markForCheck();
  }

  public async createStatement(statement: Statement) {
    const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
    this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, 'statement', id]);
  }

}