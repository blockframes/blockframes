// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, combineLatest, firstValueFrom, startWith } from 'rxjs';
import { add, differenceInMonths, isLastDayOfMonth, lastDayOfMonth } from 'date-fns';
import { Router } from '@angular/router';

// Blockframes
import {
  Right,
  RightholderRole,
  Statement,
  StatementType,
  StatementTypeValue,
  WaterfallContract,
  WaterfallRightholder,
  createDirectSalesStatement,
  createDistributorStatement,
  createDuration,
  createProducerStatement,
  filterStatements,
  getContractsWith,
  getOutgoingStatementPrerequists,
  hasContractWith,
  isProducerStatement,
  isStandaloneVersion,
  sortStatements,
  statementType,
  statementsRolesMapping
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementNewComponent } from '@blockframes/waterfall/components/statement-new/statement-new.component';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

const statementsRolesConfig: Record<StatementType, StatementRolesConfig> = {
  mainDistributor: { roles: statementsRolesMapping.mainDistributor, divider: false, visible: true },
  salesAgent: { roles: statementsRolesMapping.salesAgent, divider: false, visible: true },
  directSales: { roles: statementsRolesMapping.directSales, divider: true, visible: true },
  producer: { roles: statementsRolesMapping.producer, divider: true, visible: true },
}

function filterRightholderStatements(statements: Statement[], rightholderId: string) {
  const rightholderStatements = statements.filter(s => [s.senderId, s.receiverId].includes(rightholderId) && s.status === 'reported');
  const rightholderStatementsIds = rightholderStatements.map(s => s.id);
  const incomeIds = rightholderStatements.map(s => s.incomeIds).flat();
  const parentStatements = statements.filter(s => !rightholderStatementsIds.includes(s.id) && !isProducerStatement(s) && s.status === 'reported' && s.incomeIds.some(id => incomeIds.includes(id)));
  return [...rightholderStatements, ...parentStatements];
}

@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent implements OnInit, OnDestroy {
  public waterfall$ = this.shell.waterfall$;
  public statements: Statement[] = [];
  public rightholderContracts: (Partial<WaterfallContract> & { statements: (Statement & { number: number })[] })[] = [];
  public haveStatements: boolean;
  public rightholders: WaterfallRightholder[] = [];
  public rightholderControl = new FormControl<string>('');
  public contracts: WaterfallContract[] = [];
  public rights: Right[] = [];
  public statementTypes: StatementChipConfig[] = [];
  public selected: StatementType;
  public isStatementSender: boolean;

  private currentStateDate = new Date();
  private waterfall = this.shell.waterfall;
  private subs: Subscription[] = [];
  private statementSender: WaterfallRightholder;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private statementService: StatementService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private snackbar: MatSnackBar,
  ) {
    this.shell.setDate(this.currentStateDate);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Statements');
  }

  async ngOnInit() {
    const currentRightholder = await firstValueFrom(this.shell.currentRightholder$);
    if (!currentRightholder) {
      this.snackbar.open(`Organization "${this.orgService.org.name}" is not associated to any rightholders.`, 'close', { duration: 5000 });
      return;
    }
    /**
     * @dev statementSender should be current rightholder when we will 
     * allow rightholders other than producer (distributors) to create statements
     */
    this.statementSender = this.waterfall.rightholders.find(r => r.roles.includes('producer'));
    if (!this.statementSender) {
      this.snackbar.open(`Producer is not defined.`, 'close', { duration: 5000 });
      return;
    }

    await this.initTypes(currentRightholder);
    const versionSub = this.shell.versionId$.subscribe(async versionId => {
      const version = this.waterfall.versions.find(v => v.id === versionId);
      if (version.standalone) await this.initTypes(currentRightholder, true);
    });
    this.subs.push(versionSub);

    const sub = combineLatest([
      this.rightholderControl.valueChanges.pipe(startWith(this.rightholderControl.value)),
      this.shell.statements$
    ]).subscribe(([value, _statements]) => {
      const statements = !this.isStatementSender ? filterRightholderStatements(_statements, currentRightholder.id) : _statements;
      if (!this.selected) {
        this.rightholderContracts = [];
      } else if (this.selected !== 'directSales') {
        this.rightholderContracts = getContractsWith([this.statementSender.id, value], this.contracts, this.currentStateDate)
          .filter(c => statementsRolesMapping[this.selected].includes(c.type))
          .filter(c => this.rights.some(r => r.contractId === c.id))
          .map(c => {
            const stms = filterStatements(this.selected, [this.statementSender.id, value], c.id, statements);
            return { ...c, statements: sortStatements(stms) };
          })
          .filter(c => c.statements.length > 0);
      } else {
        const stms = filterStatements(this.selected, [this.statementSender.id, value], undefined, statements);
        this.rightholderContracts = [{ id: '', statements: sortStatements(stms) }];
      }

      this.haveStatements = this.rightholderContracts.some(c => c.statements.length > 0);

      this.cdr.markForCheck();
    });

    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private async initTypes(currentRightholder: WaterfallRightholder, isStandalone = false) {
    this.rights = await this.shell.rights();
    const statements = await this.shell.statements();
    this.isStatementSender = currentRightholder.id === this.statementSender.id;
    this.statements = !this.isStatementSender ? filterRightholderStatements(statements, currentRightholder.id) : statements;
    this.contracts = await this.shell.contracts();
    this.statementTypes = Object.entries(statementsRolesConfig).map(([key, value]: [StatementType, StatementRolesConfig]) => (
      {
        selected: false,
        key,
        value: statementType[key],
        ...value,
        visible: key === 'producer' ? this.statements.some(s => !isProducerStatement(s) && s.status === 'reported') : value.visible
      }
    ));
    this.changeType('mainDistributor', isStandalone);
  }

  public changeType(key: StatementType, reload = false) {
    if (!reload && this.selected === key) return;
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

    this.rightholderControl.setValue(this.selected !== 'directSales' ? this.rightholders[0]?.id : this.statementSender.id);
    this.cdr.markForCheck();
  }

  public async createStatement(rightholderId: string, contractId?: string, type = this.selected) {
    const duration = createDuration({
      from: add(this.currentStateDate, { days: 1 }),
      to: add(this.currentStateDate, { days: 1, months: 6 }),
    });

    // Set duration from previous statement date & periodicity
    const previousStatement = this.rightholderContracts.find(c => c.id === contractId)?.statements[0];
    if (previousStatement) {
      const difference = differenceInMonths(previousStatement.duration.to, previousStatement.duration.from);
      duration.from = add(previousStatement.duration.to, { days: 1 });
      duration.to = add(duration.from, { months: difference });

      if (isLastDayOfMonth(previousStatement.duration.to)) {
        duration.to = lastDayOfMonth(duration.to);
      }
    }

    const standalone = isStandaloneVersion(this.waterfall, this.shell.versionId$.value);

    switch (type) {
      case 'mainDistributor':
      case 'salesAgent': {
        const statement = createDistributorStatement({
          id: this.statementService.createId(),
          contractId,
          senderId: rightholderId,
          receiverId: this.statementSender.id, // Statement sender is the producer
          waterfallId: this.waterfall.id,
          duration,
          type,
          standalone
        });

        if (statement.standalone) statement.versionId = this.shell.versionId$.value;

        const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
        return this.router.navigate(['/c/o/dashboard/title/', this.waterfall.id, 'statement', id, 'edit']);
      }
      case 'directSales': {
        const statement = createDirectSalesStatement({
          id: this.statementService.createId(),
          senderId: this.statementSender.id,
          receiverId: rightholderId,
          waterfallId: this.waterfall.id,
          duration,
          standalone
        });

        if (statement.standalone) statement.versionId = this.shell.versionId$.value;

        const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
        return this.router.navigate(['/c/o/dashboard/title/', this.waterfall.id, 'statement', id, 'edit']);
      }
      case 'producer': {
        const incomeIds = await this.getIncomeIds(rightholderId, contractId, duration.to);

        const statement = createProducerStatement({
          id: this.statementService.createId(),
          contractId,
          senderId: this.statementSender.id,
          receiverId: rightholderId,
          waterfallId: this.waterfall.id,
          incomeIds,
          duration,
          standalone
        });

        if (statement.standalone) statement.versionId = this.shell.versionId$.value;

        const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
        return this.router.navigate(['/c/o/dashboard/title/', this.waterfall.id, 'statement', id]);
      }
    }
  }

  private async getIncomeIds(receiverId: string, contractId: string, date: Date) {
    const incomes = await this.shell.incomes();
    const state = await firstValueFrom(this.shell.state$);
    this.statements = await this.shell.statements();
    // should create an outgoing statement.
    const config = {
      senderId: this.statementSender.id,
      receiverId,
      statements: this.statements,
      contracts: this.contracts,
      rights: this.rights,
      titleState: state.waterfall.state,
      incomes,
      sources: this.waterfall.sources,
      date
    };

    const prerequists = getOutgoingStatementPrerequists(config);

    if (!Object.keys(prerequists).length) return [];
    if (!prerequists[contractId]) return [];
    const prerequist = prerequists[contractId];
    return prerequist.incomeIds;
  }

  public addNew(type: StatementType) {
    if (!this.isStatementSender) return;
    if (type === 'directSales') return this.createStatement(this.statementSender.id);
    this.dialog.open(StatementNewComponent, {
      data: createModalData({
        type,
        waterfall: this.shell.waterfall,
        producer: this.statementSender,
        contracts: this.contracts,
        statements: this.statements,
        date: this.currentStateDate,
        rights: this.rights,
        onConfirm: async (statementId: string, contractId: string) => {
          await this.createStatement(statementId, contractId, type);
        }
      })
    });
  }
}
