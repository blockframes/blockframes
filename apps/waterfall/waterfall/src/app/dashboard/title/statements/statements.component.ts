// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, combineLatest, firstValueFrom, map, startWith } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import {
  Right,
  RightholderRole,
  Statement,
  StatementType,
  StatementTypeValue,
  WaterfallContract,
  WaterfallRightholder,
  filterStatements,
  getContractsWith,
  hasContractWith,
  initStatementDuration,
  isProducerStatement,
  sortStatements,
  statementType,
  statementsRolesMapping,
  toLabel
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { CreateStatementConfig, StatementService } from '@blockframes/waterfall/statement.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementNewComponent } from '@blockframes/waterfall/components/statement-new/statement-new.component';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';

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

function initStatementChips(statements: Statement[]): StatementChipConfig[] {
  const hasDistribOrDirectSalesReportedStatements = statements.some(s => !isProducerStatement(s) && s.status === 'reported');
  return Object.entries(statementsRolesConfig).map(([key, value]: [StatementType, StatementRolesConfig]) => (
    {
      selected: false,
      key,
      value: statementType[key],
      ...value,
      // producer statements are visible only if there are reported statements from distributors or direct sales
      visible: key === 'producer' ? hasDistribOrDirectSalesReportedStatements : value.visible
    }
  ));
}

const statementsRolesConfig: Record<StatementType, StatementRolesConfig> = {
  mainDistributor: { roles: statementsRolesMapping.mainDistributor, divider: false, visible: true },
  salesAgent: { roles: statementsRolesMapping.salesAgent, divider: false, visible: true },
  directSales: { roles: statementsRolesMapping.directSales, divider: true, visible: true },
  producer: { roles: statementsRolesMapping.producer, divider: true, visible: true },
}

interface RightholderStatementsConfig {
  type: StatementType;
  rightholderId: string;
  producerId: string;
  date: Date;
  contracts: WaterfallContract[];
  statements: Statement[];
  rights: Right[];
}

type ContractAndStatements = (Partial<WaterfallContract> & { statements: (Statement & { number: number })[] });

/**
 * Returns statements by contracts for the given rightholder id
 * @param config 
 * @returns 
 */
function getRightholderStatements(config: RightholderStatementsConfig): ContractAndStatements[] {
  if (!config.type) return [];

  if (config.type === 'directSales') {
    const stms = filterStatements(config.type, [config.producerId, config.producerId], undefined, config.statements);
    return [{ id: '', statements: sortStatements(stms) }];
  }

  return getContractsWith([config.producerId, config.rightholderId], config.contracts, config.date)
    .filter(c => statementsRolesMapping[config.type].includes(c.type))
    .filter(c => config.rights.some(r => r.contractId === c.id))
    .map(c => {
      const stms = filterStatements(config.type, [config.producerId, config.rightholderId], c.id, config.statements);
      return { ...c, statements: sortStatements(stms) };
    })
    .filter(c => c.statements.length > 0);
}

@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent implements OnInit, OnDestroy {
  public displayNoStatementPage$ = this.shell.statements$.pipe(map(statements => !statements.length));
  public rightholderContracts: ContractAndStatements[] = [];
  public haveStatements: boolean;
  public rightholders: WaterfallRightholder[] = [];
  public rightholderControl = new FormControl<string>('');
  public contracts: WaterfallContract[] = [];
  public statementChips: StatementChipConfig[] = [];
  public selected: StatementType;
  public isStatementSender: boolean;
  public isRefreshing$ = this.shell.isRefreshing$;

  private statements: Statement[] = [];
  private currentDate = new Date();
  private waterfall = this.shell.waterfall;
  private subs: Subscription[] = [];
  private statementSender: WaterfallRightholder;
  /** @dev there should always be only one producer */ // TODO #9553
  private producer = this.waterfall.rightholders.find(r => r.roles.includes('producer'));

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
    this.shell.setDate(this.currentDate);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Statements');
  }

  async ngOnInit() {
    /**
     * @dev statementSender should be current rightholder when we will 
     * allow rightholders other than producer (distributors) to create statements
     */
    this.statementSender = this.waterfall.rightholders.find(r => r.roles.includes('producer'));

    const currentRightholder = await firstValueFrom(this.shell.currentRightholder$);
    if (!currentRightholder) {
      this.snackbar.open(`Organization "${this.orgService.org.name}" is not associated to any rightholders.`, 'close', { duration: 5000 });
      // TODO #9553: redirect to the rightholder page 
      return;
    }

    if (!this.producer) {
      this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} is not defined.`, 'WATERFALL MANAGEMENT', { duration: 5000 })
        .onAction()
        .subscribe(() => {
          this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init'])
        });
      return;
    }

    const rightsSub = this.shell.rights$.subscribe(async rights => {
      if (!rights.find(r => r.rightholderId === this.statementSender.id)) {
        this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} should have at least one receipt share in the waterfall.`, 'WATERFALL MANAGEMENT', { duration: 5000 })
          .onAction()
          .subscribe(() => {
            this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init'])
          });
      }
    });
    this.subs.push(rightsSub);

    this.contracts = await this.shell.contracts();

    const versionSub = combineLatest([this.shell.rightholderStatements$, this.shell.versionId$]).subscribe(([statements]) => {
      this.isStatementSender = currentRightholder.id === this.statementSender.id;
      this.statements = statements;
      this.statementChips = initStatementChips(this.statements);
      this.changeType();
    });
    this.subs.push(versionSub);

    const sub = combineLatest([
      this.rightholderControl.valueChanges.pipe(startWith(this.rightholderControl.value)),
      this.shell.rightholderStatements$,
      this.shell.rights$
    ]).subscribe(([rightholderId, statements, rights]) => {
      this.rightholderContracts = getRightholderStatements({
        type: this.selected,
        rightholderId,
        producerId: this.producer.id,
        date: this.currentDate,
        contracts: this.contracts,
        statements,
        rights
      });

      this.haveStatements = this.rightholderContracts.some(c => c.statements.length > 0);
      this.cdr.markForCheck();
    });

    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public changeType(key: StatementType = 'mainDistributor') {
    // Highlight the selected chip
    this.statementChips = this.statementChips.map(type => type.key === key ? { ...type, selected: true } : { ...type, selected: false });

    // Set the current selected type
    const selected = this.statementChips.find(type => type.selected);
    this.selected = selected.key;

    // Update the rightholders select and set default value for rightholderControl
    const rightholderKey = this.selected === 'producer' ? 'receiverId' : 'senderId';
    this.rightholders = this.waterfall.rightholders
      .filter(r => r.id !== this.statementSender.id) // Rightholder is not the statement sender (current rightholder)
      .filter(r => hasContractWith([this.statementSender.id, r.id], this.contracts, this.currentDate)) // Rightholder have at least one contract with the statement sender (current rightholder)
      .filter(r => r.roles.some(role => selected.roles.includes(role))) // Rightholder have the selected role
      .filter(r => this.statements.some(stm => stm[rightholderKey] === r.id && stm.type === selected.key)); // Rightholder have statements of the selected type (meaning he already have rights in the waterfall)

    const defaultRightholder = this.selected !== 'directSales' ? this.rightholders[0]?.id : this.producer.id;
    this.rightholderControl.setValue(defaultRightholder);
    this.cdr.markForCheck();
  }

  public async addStatement(type: StatementType) {
    if (type === 'directSales') return this.createStatement();
    const statements = await this.shell.statements();
    const rights = await this.shell.rights();
    const currentRightholder = await firstValueFrom(this.shell.currentRightholder$);
    const canBypassRules = await firstValueFrom(this.shell.canBypassRules$);
    this.dialog.open(StatementNewComponent, {
      data: createModalData({
        type,
        currentRightholder,
        canBypassRules,
        waterfall: this.shell.waterfall,
        producer: this.statementSender,
        contracts: this.contracts,
        statements,
        date: this.currentDate,
        rights,
        onConfirm: async (rightholderId: string, contractId: string) => {
          await this.createStatement(rightholderId, contractId, type);
        }
      })
    });
  }

  public async createStatement(rightholderId?: string, contractId?: string, type = this.selected) {
    const previousStatement = this.rightholderContracts.find(c => c.id === contractId)?.statements[0];
    const duration = initStatementDuration(this.currentDate, previousStatement?.duration);

    const incomeIds = type === 'producer' ?
      (await this.shell.getIncomeIds(this.statementSender.id, rightholderId, contractId, duration.to)) :
      undefined;

    const config: CreateStatementConfig = {
      producerId: this.producer.id,
      rightholderId,
      waterfall: this.waterfall,
      versionId: this.shell.versionId$.value,
      type,
      duration,
      contractId,
      incomeIds
    }

    const statementId = await this.statementService.initStatement(config);

    const route = ['/c/o/dashboard/title/', this.waterfall.id, 'statement', statementId];
    if (type !== 'producer') route.push('edit');
    return this.router.navigate(route);
  }

  public removeStatement(statement: Statement) {
    if (statement.status !== 'draft') return;

    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Are you sure?',
        question: 'If you remove a statement from the waterfall, you will be able to create it again.',
        confirm: 'Yes, remove statement.',
        cancel: 'No, keep statement.',
        onConfirm: async () => {
          await this.statementService.remove(statement.id, { params: { waterfallId: statement.waterfallId } })
          this.snackbar.open(`Statement deleted from waterfall !`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }
}
