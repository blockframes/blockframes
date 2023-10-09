import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Block,
  History,
  Income,
  IncomeState,
  Movie,
  PricePerCurrency,
  Right,
  Statement,
  Version,
  Waterfall,
  WaterfallContract,
  createDuration,
  createProducerStatement,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  getRightsOf,
  mainCurrency,
  pathExists
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { unique } from '@blockframes/utils/helpers';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { add } from 'date-fns';

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
  private rights: Right[];
  private incomes: Income[];
  private state: WaterfallState;

  public currentState: History;
  public currentBlock: string;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const versionId = this.route.snapshot.paramMap.get('versionId');
    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);

    this.waterfall = data.waterfall;
    this.statements = data.statements;
    this.contracts = data.contracts;
    this.rights = data.rights;
    this.incomes = data.incomes;

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await this.waterfallService.buildWaterfall({ waterfallId, versionId });
    this.history = this.state.waterfall.history;
    this.version = this.state.version;
    this.blocks = this.version.blockIds.map(id => data.blocks.find(b => b.id === id));
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
    const currentStateDate = new Date(this.currentState.date);
    const statements = this.statements.filter(s => s.payments.external.find(p => p.to === id && p.status === 'received'));
    const excludedContractsIds = unique(statements.map(s => getContractAndAmendments(s.contractId, this.contracts).map(c => c.id)).flat());

    const parentPayments = statements.map(s => s.payments.external.filter(p => p.to === id && p.status === 'received').map(p => ({ statementId: s.id, paymentId: p.id }))).flat();
    const incomeIds = unique(statements.map(s => s.payments.external.filter(p => p.to === id && p.status === 'received').map(p => p.incomeIds).flat()).flat());
    const incomes = this.incomes.filter(i => incomeIds.includes(i.id));
    if (!statements.length) return [];

    const contractsIds = this.contracts.
      filter(c => (c.buyerId === id || c.sellerId === id) && !excludedContractsIds.find(id => id === c.id))
      .map(c => getCurrentContract(getContractAndAmendments(c.id, this.contracts), currentStateDate).id);

    const contracts = unique(contractsIds).map(id => this.contracts.find(c => c.id === id));
    const sources = unique(incomes.map(i => getAssociatedSource(i, this.waterfall.sources)));
    const filteredContracts = contracts.filter(c => {
      const rights = getRightsOf(this.rights, c);
      return rights.some(r => sources.some(s => pathExists(r.id, s.id, this.state.waterfall.state)));
    });

    const roles = this.waterfall.rightholders.find(r => r.id === id)?.roles;
    if (roles.length === 0 || roles.length > 1) {
      this.snackBar.open(`Could not determine statement type for "${this.getRightholderName(id)}"`, 'close', { duration: 5000 });
      // TODO #9493 handle multpile roles to create statements
      return [];
    }

    switch (roles[0]) {
      case 'producer':
        return filteredContracts.map(c => createProducerStatement({
          contractId: c.id,
          rightholderId: id,
          waterfallId: this.waterfall.id,
          parentPayments,
          incomeIds,
          duration: createDuration({
            from: add(currentStateDate, { months: 6 }), // TODO #9493 get periodicity from waterfall document
            to: add(currentStateDate, { months: 12 }),
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