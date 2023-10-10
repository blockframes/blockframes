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

interface RightholderStatements {
  rightholderId: string,
  pending: Statement[],
  existing: Statement[]
}

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
  public rightholderStatements: RightholderStatements;
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
    this.rightholderStatements = undefined;
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

  public getRightholder(id: string) {
    return this.waterfall.rightholders.find(r => r.id === id);
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.getRightholder(id)?.name || '--';
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

  public statementsToCreate(rightholderId: string) {
    const currentStateDate = new Date(this.currentState.date);

    // Fetch existing statements for this rightholder
    const existingStatements = this.statements.filter(s => s.rightholderId === rightholderId);

    // Fetch active statements where rightsholder has received payments but not created statements
    const statements = this.statements
      .filter(s => s.duration.to.getTime() <= currentStateDate.getTime())
      .filter(s => s.payments.external.find(p => p.to === rightholderId && p.status === 'received'));
    if (!statements.length) return [];

    // TODO #9493 handle multiple roles to create statements
    const roles = this.waterfall.rightholders.find(r => r.id === rightholderId)?.roles;
    if (roles.length === 0 || roles.length > 1) {
      this.snackBar.open(`Could not determine statement type for "${this.getRightholderName(rightholderId)}"`, 'close', { duration: 5000 });
      return [];
    }

    // Fetch contract ids that are related to the statements (remove amendments or root contracts)
    const excludedContractsIds = unique(statements.map(s => getContractAndAmendments(s.contractId, this.contracts).map(c => c.id)).flat());

    // Fetch current contracts where the rightholder is involved (buyer or seller) that are not in the excluded list
    const contractsIds = this.contracts.
      filter(c => (c.buyerId === rightholderId || c.sellerId === rightholderId) && !excludedContractsIds.find(id => id === c.id))
      .map(c => getCurrentContract(getContractAndAmendments(c.id, this.contracts), currentStateDate)?.id)
      .filter(c => !!c); // Remove contracts that are not active at the current state date
    const contracts = unique(contractsIds).map(id => this.contracts.find(c => c.id === id));

    // Fetch incomes and sources related to the statements
    const incomeIds = unique(statements.map(s => s.payments.external.filter(p => p.to === rightholderId && p.status === 'received').map(p => p.incomeIds).flat()).flat());
    const sources = this.getIncomesSources(incomeIds);

    // Filter contracts that have at least one right that is related to the sources
    const filteredContracts = contracts.filter(c => {
      const rights = getRightsOf(this.rights, c);
      return rights.some(r => sources.some(s => pathExists(r.id, s.id, this.state.waterfall.state)));
    });

    const parentPayments = statements.map(s => s.payments.external.filter(p => p.to === rightholderId && p.status === 'received').map(p => ({ statementId: s.id, paymentId: p.id }))).flat();

    switch (roles[0]) {
      case 'producer':
        return filteredContracts.map(c => createProducerStatement({
          id: this.statementService.createId(),
          contractId: c.id,
          rightholderId,
          waterfallId: this.waterfall.id,
          parentPayments,
          incomeIds: incomeIds.filter(id => {
            // Filter incomes again to keep only incomes that are related to this contract
            const income = this.incomes.find(i => i.id === id);
            const source = getAssociatedSource(income, this.waterfall.sources);
            const rights = getRightsOf(this.rights, c);
            return rights.some(r => pathExists(r.id, source.id, this.state.waterfall.state));
          }),
          duration: createDuration({
            from: add(currentStateDate, { days: 1 }), // TODO #9493 get periodicity from waterfall document
            to: add(currentStateDate, { days: 1, months: 6 }),
          })
        })).filter(s => !existingStatements.find(e =>
          e.contractId === s.contractId
          && e.duration.from.getTime() === s.duration.from.getTime()
        ));
      default:
        // TODO #9493 handle other roles
        return []
    }
  }

  public getIncomesSources(incomeIds: string[]) {
    const incomes = this.incomes.filter(i => incomeIds.includes(i.id));
    return unique(incomes.map(i => getAssociatedSource(i, this.waterfall.sources)));
  }

  public displayRightholderStatements(rightholderId: string) {
    this.rightholderStatements = {
      rightholderId,
      pending: this.statementsToCreate(rightholderId),
      existing: this.statements.filter(s => s.rightholderId === rightholderId)
    };
    this.cdRef.markForCheck();
  }

  public async createStatement(statement: Statement, redirect = true) {
    const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
    if (redirect) return this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, 'statement', id]);
    this.statements.push(statement);
    this.displayRightholderStatements(statement.rightholderId);
  }

}