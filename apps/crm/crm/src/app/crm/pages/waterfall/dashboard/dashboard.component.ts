import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Block,
  History,
  Income,
  IncomeState,
  PricePerCurrency,
  ProducerStatement,
  Right,
  RightholderRole,
  Statement,
  Version,
  Waterfall,
  WaterfallContract,
  WaterfallRightholder,
  createDuration,
  createProducerStatement,
  getAssociatedSource,
  getIncomesSources,
  getOutgoingStatementPrerequists,
  hasContractWith,
  isProducerStatement,
  mainCurrency,
  movieCurrencies,
  rightholderGroups
} from '@blockframes/model';
import { formatPair } from '@blockframes/ui/price-per-currency/price-per-currency.component';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { add } from 'date-fns';
import { firstValueFrom } from 'rxjs';

interface OutgoingStatements {
  senderId: string,
  pending: ProducerStatement[],
  existing: ProducerStatement[]
}

@Component({
  selector: 'crm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public waterfall: Waterfall;
  public version: Version;
  public statementBlocks: Block[];
  public history: History[];
  private statements: Statement[];
  public outgoingStatements: OutgoingStatements;
  public contracts: WaterfallContract[] = [];
  private rights: Right[];
  private incomes: Income[];
  private state: WaterfallState;
  public currentState: History;
  public currentBlock: string;
  public producer: WaterfallRightholder;
  public options = { xAxis: { categories: [] }, series: [] };
  public formatter = { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    this.shell.setVersionId(this.route.snapshot.paramMap.get('versionId'));
    this.shell.setDate(undefined);

    this.waterfall = this.shell.waterfall;
    this.statements = await this.shell.statements();
    this.contracts = await this.shell.contracts();
    this.rights = await this.shell.rights();
    this.incomes = await this.shell.incomes();
    const versionBlocks = await firstValueFrom(this.shell.versionBlocks$);

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await firstValueFrom(this.shell.state$);
    this.history = this.state.waterfall.history;
    this.version = this.state.version;
    this.statementBlocks = versionBlocks.filter(b => this.statements.find(s => s.duration.to.getTime() === b.timestamp));
    if (this.statementBlocks.length) {
      this.currentBlock = this.statementBlocks[this.statementBlocks.length - 1].id;
      this.selectBlock(this.currentBlock);
      if (!this.producer) {
        this.snackBar.open('No producer found for this waterfall. Please set rightholders roles.', 'close', { duration: 5000 });
      } else {
        this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
      }
    } else {
      this.snackBar.open('No statements found for this waterfall', 'close', { duration: 5000 });
    }

    this.cdRef.markForCheck();
  }

  public selectBlock(blockId: string) {
    const index = this.version.blockIds.indexOf(blockId);
    this.currentState = this.history[index + 1]; // First history entry is always empty (init)
    this.producer = Object.values(this.currentState.orgs)
      .map(({ id }) => this.getRightholder(id))
      .find(({ roles }) => roles.includes('producer'));

    if (this.producer) this.displayOutgoingStatements();

    this.buildGraph(blockId);
    this.cdRef.markForCheck();
  }

  private buildGraph(blockId: string) {
    const filteredStatementBlocks = this.statementBlocks.filter(b => this.version.blockIds.indexOf(b.id) <= this.version.blockIds.indexOf(blockId));
    const data = filteredStatementBlocks.map(block => {
      const index = this.version.blockIds.indexOf(block.id);
      const state = this.history[index + 1];
      const incomes = Object.values(state.incomes).map(incomeState => {
        const income = this.incomes.find(i => i.id === incomeState.id);
        return { amount: incomeState.amount, source: getAssociatedSource(income, this.waterfall.sources) };
      });

      const incomesBySource = this.waterfall.sources.map(source => {
        const incomesForSource = incomes.filter(i => i.source.id === source.id);
        const amount = incomesForSource.length ? incomesForSource.map(i => i.amount).reduce((a, b) => a + b) : 0;
        return { source, amount: Math.round(amount) };
      });

      return { date: new Date(block.timestamp), incomesBySource };
    });

    const categories = data.map(h => new Date(h.date).toISOString().slice(0, 10));
    const sourcesWithIncome = this.waterfall.sources.filter(s => data.some(d => d.incomesBySource.some(i => i.source.id === s.id && i.amount > 0)));
    const series = sourcesWithIncome.map(source => ({
      name: source.name,
      data: data.map(d => d.incomesBySource.find(i => i.source.id === source.id).amount)
    }));

    this.options = { xAxis: { categories }, series };
  }

  public getTotalIncomes(incomeState: Record<string, IncomeState>): PricePerCurrency {
    const incomeStates = Object.values(incomeState);
    if (!incomeStates.length) return formatPair(0);
    return formatPair(incomeStates.map(a => a.amount).reduce((a, b) => a + b));
  }

  public getRightholder(id: string) {
    return this.waterfall.rightholders.find(r => r.id === id);
  }

  public getPendingRevenue(rightholderId: string): PricePerCurrency {
    const pendingRevenue = this.statements
      .filter(s => s.receiverId === rightholderId && s.payments.rightholder?.status === 'pending')
      .map(s => s.payments.rightholder);

    const pending: PricePerCurrency = {};
    pendingRevenue.forEach(i => {
      pending[i.currency] ||= 0;
      pending[i.currency] += i.price;
    });
    return pending;
  }

  private statementsToCreate() {
    const currentStateDate = new Date(this.currentState.date);

    const outgoingStatementBeneficiaries = Object.keys(rightholderGroups.beneficiaries) as RightholderRole[];
    const rightholders = this.waterfall.rightholders
      .filter(r => r.id !== this.producer.id)
      .filter(r => hasContractWith([this.producer.id, r.id], this.contracts, currentStateDate)) // Rightholder have a contract with the statement sender
      .filter(r => r.roles.some(role => outgoingStatementBeneficiaries.includes(role))) // Rightholder can receive an outgoing statement

    return rightholders.map(receiver => {

      const config = {
        senderId: this.producer.id,
        receiverId: receiver.id,
        statements: this.statements,
        contracts: this.contracts,
        rights: this.rights,
        titleState: this.state.waterfall.state,
        incomes: this.incomes,
        sources: this.waterfall.sources,
        date: currentStateDate
      };

      const prerequists = getOutgoingStatementPrerequists(config);

      if (!Object.keys(prerequists).length) return;
      const statements: ProducerStatement[] = [];
      for (const contractId in prerequists) {
        const prerequist = prerequists[contractId];
        const producerStatement = createProducerStatement({
          id: this.statementService.createId(),
          contractId: prerequist.contract.id,
          senderId: this.producer.id,
          receiverId: receiver.id,
          waterfallId: this.waterfall.id,
          incomeIds: prerequist.incomeIds,
          duration: createDuration({
            from: add(currentStateDate, { days: 1 }),
            to: add(currentStateDate, { days: 1, months: 6 }),
          })
        });
        statements.push(producerStatement);
      }

      return statements;

    }).filter(s => !!s).flat();
  }

  public getIncomesSources(incomeIds: string[]) {
    const incomes = this.incomes.filter(i => incomeIds.includes(i.id));
    return getIncomesSources(incomes, this.waterfall.sources);
  }

  private displayOutgoingStatements() {
    this.outgoingStatements = {
      senderId: this.producer.id,
      pending: this.statementsToCreate(),
      existing: this.statements.filter(s => s.senderId === this.producer.id && isProducerStatement(s)) as ProducerStatement[]
    };
    this.cdRef.markForCheck();
  }

  public async createStatement(statement: Statement, redirect = true) {
    const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
    if (redirect) return this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, 'statement', id]);
    this.statements.push(statement);
    this.displayOutgoingStatements();
  }

  public goTo(type: 'statements' | 'rightholders', id: string) {
    this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, type, id]);
  }
}