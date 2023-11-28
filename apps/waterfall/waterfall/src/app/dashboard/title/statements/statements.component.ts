// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, firstValueFrom, startWith } from 'rxjs';

// Blockframes
import {
  Income,
  Right,
  RightholderRole,
  Statement,
  StatementType,
  StatementTypeValue,
  WaterfallContract,
  WaterfallRightholder,
  canCreateOutgoingStatement,
  filterStatements,
  getContractsWith,
  hasContractWith,
  isProducerStatement,
  rightholderGroups,
  sortStatements,
  statementType
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';

interface StatementRolesConfig {
  roles: RightholderRole[],
  divider: boolean,
  visible: boolean,
};

interface StatementChipConfig {
  roles: RightholderRole[];
  divider: boolean;
  selected: boolean;
  key: StatementType;
  value: StatementTypeValue;
}

const statementsRolesMapping: Record<StatementType, StatementRolesConfig> = {
  mainDistributor: { roles: ['mainDistributor'], divider: false, visible: true },
  salesAgent: { roles: ['salesAgent'], divider: false, visible: true },
  directSales: { roles: ['producer'], divider: true, visible: true },
  producer: { roles: Object.keys(rightholderGroups.beneficiaries) as RightholderRole[], divider: true, visible: true },
}

@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent implements OnInit, OnDestroy {
  public waterfall$ = this.shell.waterfall$;
  public currentStateDate = new Date();

  public statements: Statement[] = [];
  public rightholderContracts: (Partial<WaterfallContract> & { statements: (Statement & { number: number })[] })[] = [];
  public statementSender: WaterfallRightholder;
  public canCreateStatement: boolean;
  public haveStatements: boolean;

  public rightholders: WaterfallRightholder[] = [];
  public rightholderControl = new FormControl<string>('');

  private contracts: WaterfallContract[] = [];
  private rights: Right[] = [];
  private incomes: Income[] = [];
  private state: WaterfallState;
  public statementTypes: StatementChipConfig[] = [];
  public selected: StatementType;
  private waterfall = this.shell.waterfall;
  private sub: Subscription;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private cdr: ChangeDetectorRef
  ) {
    this.shell.setDate(this.currentStateDate);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Statements');
  }

  async ngOnInit() {
    this.state = await firstValueFrom(this.shell.state$);
    this.rights = await this.shell.rights();
    this.statements = await this.shell.statements();
    this.statementSender = await firstValueFrom(this.shell.currentRightholder$);
    this.contracts = await this.shell.contracts();
    this.incomes = await this.shell.incomes();
    this.statementTypes = Object.entries(statementsRolesMapping).map(([key, value]: [StatementType, StatementRolesConfig]) => (
      {
        selected: false,
        key,
        value: statementType[key],
        ...value,
        visible: key === 'producer' ? this.statements.some(s => !isProducerStatement(s) && s.status === 'reported') : value.visible
      }
    ));

    this.changeType('mainDistributor');

    this.sub = this.rightholderControl.valueChanges.pipe(startWith(this.rightholderControl.value)).subscribe(value => {

      if (this.selected !== 'directSales') {
        this.rightholderContracts = getContractsWith([this.statementSender.id, value], this.contracts, this.currentStateDate)
          .filter(c => this.rights.some(r => r.contractId === c.id))
          .map(c => {
            const statements = filterStatements(this.selected, [this.statementSender.id, value], c.id, this.statements);
            return { ...c, statements: sortStatements(statements) };
          });
      } else {
        const statements = filterStatements(this.selected, [this.statementSender.id, value], undefined, this.statements);
        this.rightholderContracts = [{ id: '', statements: sortStatements(statements) }];
      }

      this.haveStatements = this.rightholderContracts.some(c => c.statements.length > 0);

      const config = {
        senderId: this.statementSender.id,
        receiverId: value,
        statements: this.statements,
        contracts: this.contracts,
        rights: this.rights,
        titleState: this.state.waterfall.state,
        incomes: this.incomes,
        sources: this.waterfall.sources,
        date: this.currentStateDate
      };

      this.canCreateStatement = this.selected === 'producer' ? canCreateOutgoingStatement(config) : true;

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public changeType(key: StatementType) {
    if (this.selected === key) return;
    this.statementTypes = this.statementTypes.map(type => type.key === key ? { ...type, selected: !type.selected } : { ...type, selected: false });
    const selected = this.statementTypes.find(type => type.selected);
    this.selected = selected.key;
    if (!selected) this.rightholders = [];
    const rightholderKey = this.selected === 'producer' ? 'receiverId' : 'senderId';
    this.rightholders = this.waterfall.rightholders
      .filter(r => r.id !== this.statementSender.id) // Rightholder is not the statement sender (current rightholder)
      .filter(r => hasContractWith([this.statementSender.id, r.id], this.contracts, this.currentStateDate)) // Rightholder have at least one contract with the statement sender (current rightholder)
      .filter(r => r.roles.some(role => selected.roles.includes(role))) // Rightholder have the selected role
      .filter(r => this.statements.some(stm => stm[rightholderKey] === r.id && stm.type === selected.key)); // Rightholder have statements of the selected type (meaning he already have rights in the waterfall)

    this.rightholderControl.setValue(this.rightholders[0]?.id);
    this.cdr.markForCheck();
  }
}
