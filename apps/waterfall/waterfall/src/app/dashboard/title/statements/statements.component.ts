// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, combineLatest, map, startWith } from 'rxjs';
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
  canCreateStatement,
  canOnlyReadStatements,
  createWaterfallContract,
  filterStatements,
  getContractsWith,
  hasContractWith,
  initStatementDuration,
  isProducerStatement,
  isStandaloneVersion,
  rightholderKey,
  sortStatements,
  statementType,
  statementsRolesMapping,
  toLabel
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { CreateStatementConfig, StatementService } from '@blockframes/waterfall/statement.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementNewComponent, StatementNewData } from '@blockframes/waterfall/components/statement/statement-new/statement-new.component';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { Intercom } from 'ng-intercom';

interface StatementRolesConfig {
  roles: RightholderRole[],
  divider: boolean,
  visible: boolean,
};

interface StatementChipConfig {
  roles: RightholderRole[];
  color?: 'primary' | 'warn';
  divider: boolean;
  selected: boolean;
  key: StatementType;
  value: StatementTypeValue | 'Financiers / Co-Producers / Authors...';
}

function initStatementChips(statements: Statement[]): StatementChipConfig[] {
  const hasDistribOrDirectSalesReportedStatements = statements.some(s => !isProducerStatement(s) && s.status === 'reported');
  return Object.entries(statementsRolesConfig).map(([key, value]: [StatementType, StatementRolesConfig]) => (
    {
      selected: false,
      key,
      value: key === 'producer' ? 'Financiers / Co-Producers / Authors...' : statementType[key], // TODO #9699  lang
      ...value,
      // producer statements are visible only if there are reported statements from distributors or direct sales
      visible: key === 'producer' ? hasDistribOrDirectSalesReportedStatements : value.visible,
      color: key === 'producer' ? 'warn' : 'primary'
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

type ContractAndStatements = (WaterfallContract & { statements: (Statement & { number: number })[] });

/**
 * Returns statements by contracts for the given rightholder id
 * @param config 
 * @returns 
 */
function getRightholderStatements(config: RightholderStatementsConfig): ContractAndStatements[] {
  if (!config.type) return [];

  if (config.type === 'directSales') {
    const stms = filterStatements(config.type, [config.producerId, config.producerId], undefined, config.statements);
    return [{ ...createWaterfallContract({}), statements: sortStatements(stms) }];
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
  public statementChips: StatementChipConfig[] = [];
  public selected: StatementType;
  public isRefreshing$ = this.shell.isRefreshing$;
  public isStandaloneVersion$ = this.shell.versionId$.pipe(map(versionId => isStandaloneVersion(this.shell.waterfall, versionId)));
  public canBypassRules = this.shell.canBypassRules;
  public accessibleDocumentIds$ = this.shell.rightholderDocuments$.pipe(map(docs => docs.map(doc => doc.id)));

  private contracts: WaterfallContract[] = [];
  private statements: Statement[] = [];
  private currentDate = new Date();
  private subs: Subscription[] = [];
  // TODO #9692 implement this in app to avoid issues with multiple producers
  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
  private readonly = canOnlyReadStatements(this.shell.currentRightholder, this.shell.canBypassRules);

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private statementService: StatementService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) {
    this.shell.setDate(this.currentDate);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, $localize`Statements`);
  }

  async ngOnInit() {

    if (!this.shell.currentRightholder) {
      this.snackbar.open($localize`Organization "${this.orgService.org.name}" is not associated to any rightholders.`, this.shell.canBypassRules ? $localize`EDIT RIGHT HOLDERS` : $localize`ASK FOR HELP`, { duration: 5000 })
        .onAction()
        .subscribe(() => {
          if (this.shell.canBypassRules) {
            this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'right-holders']);
          } else {
            this.intercom.show($localize`My organization "${this.orgService.org.name}" is not associated to any rightholders in the waterfall "${this.shell.movie.title.international}"`);
          }
        });
      return;
    }

    if (!this.producer) {
      this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} is not defined.`, this.shell.canBypassRules ? $localize`WATERFALL MANAGEMENT` : $localize`ASK FOR HELP`, { duration: 5000 }) // TODO #9699 tolabel lang
        .onAction()
        .subscribe(() => {
          if (this.shell.canBypassRules) {
            this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init']);
          } else {
            this.intercom.show(`${toLabel('producer', 'rightholderRoles')} is not defined in the waterfall "${this.shell.movie.title.international}"`); // TODO #9699 tolabel lang
          }
        });
      return;
    }

    const rightsSub = this.shell.rights$.subscribe(async rights => {
      if (!rights.find(r => r.rightholderId === this.producer.id)) {
        this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} should have at least one receipt share in the waterfall.`, this.shell.canBypassRules ? $localize`WATERFALL MANAGEMENT` : $localize`ASK FOR HELP`, { duration: 5000 }) // TODO #9699 tolabel lang
          .onAction()
          .subscribe(() => {
            if (this.shell.canBypassRules) {
              this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init']);
            } else {
              this.intercom.show(`${toLabel('producer', 'rightholderRoles')} is not defined in the waterfall "${this.shell.movie.title.international}"`); // TODO #9699 tolabel lang
            }
          });
      } else if (!canOnlyReadStatements(this.shell.currentRightholder, this.shell.canBypassRules) && !rights.find(r => r.rightholderId === this.shell.currentRightholder.id)) {
        this.snackbar.open($localize`Current rightholder should have at least one receipt share in the waterfall.`, this.shell.canBypassRules ? $localize`WATERFALL MANAGEMENT` : $localize`ASK FOR HELP`, { duration: 5000 })
          .onAction()
          .subscribe(() => {
            if (this.shell.canBypassRules) {
              this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init']);
            } else {
              this.intercom.show(`${toLabel('producer', 'rightholderRoles')} is not defined in the waterfall "${this.shell.movie.title.international}"`); // TODO #9699 tolabel lang
            }
          });
      }
    });
    this.subs.push(rightsSub);

    this.contracts = await this.shell.contracts();

    const versionSub = combineLatest([this.shell.rightholderStatements$, this.shell.versionId$]).subscribe(([statements]) => {
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
    this.rightholders = this.shell.waterfall.rightholders
      .filter(r => r.id !== this.producer.id) // Rightholder is not the producer
      .filter(r => (this.shell.canBypassRules || this.readonly) || r.id === this.shell.currentRightholder.id)
      .filter(r => hasContractWith([this.producer.id, r.id], this.contracts, this.currentDate)) // Rightholder have at least one contract with the producer
      .filter(r => r.roles.some(role => selected.roles.includes(role))) // Rightholder have the selected role
      .filter(r => this.statements.some(stm => stm[rightholderKey(this.selected)] === r.id && stm.type === selected.key)); // Rightholder have statements of the selected type (meaning he already have rights in the waterfall)

    const defaultRightholder = this.selected !== 'directSales' ? this.rightholders[0]?.id : this.producer.id;
    this.rightholderControl.setValue(defaultRightholder);
    this.cdr.markForCheck();
  }

  public async addStatement(type: StatementType) {
    if (type === 'directSales') return this.createStatement(undefined, undefined, type);
    const statements = await this.shell.statements();
    const rights = await this.shell.rights();

    const data: StatementNewData = {
      type,
      currentRightholder: this.shell.currentRightholder,
      canBypassRules: this.shell.canBypassRules,
      waterfall: this.shell.waterfall,
      producer: this.producer,
      contracts: this.contracts,
      statements,
      date: this.currentDate,
      rights,
      onConfirm: async (rightholderId: string, contractId: string) => {
        await this.createStatement(rightholderId, contractId, type);
      }
    };

    this.dialog.open(StatementNewComponent, { data: createModalData(data) });
  }

  public async createStatement(rightholderId?: string, contractId?: string, type = this.selected) {
    const previousStatement = this.rightholderContracts.find(c => c.id === contractId)?.statements[0];
    const duration = initStatementDuration(this.currentDate, previousStatement?.duration);

    const incomeIds = type === 'producer' ?
      (await this.shell.getIncomeIds(this.producer.id, rightholderId, contractId, duration.to)) :
      undefined;

    const config: CreateStatementConfig = {
      producerId: this.producer.id,
      rightholderId,
      waterfall: this.shell.waterfall,
      versionId: this.shell.versionId$.value,
      type,
      duration,
      contractId,
      incomeIds
    }

    const statementId = await this.statementService.initStatement(config);

    const route = ['/c/o/dashboard/title/', this.shell.waterfall.id, 'statement', statementId];
    if (type !== 'producer') route.push('edit');
    return this.router.navigate(route);
  }

  public removeStatement(statement: Statement) {
    if (statement.status !== 'draft') return;

    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`Are you sure?`,
        question: $localize`If you remove a statement from the waterfall, you will be able to create it again.`,
        confirm: $localize`Yes, remove statement.`,
        cancel: $localize`No, keep statement.`,
        onConfirm: async () => {
          await this.statementService.remove(statement.id, { params: { waterfallId: statement.waterfallId } })
          this.snackbar.open($localize`Statement deleted`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }

  public canCreateStatement(type: StatementType, contracts: ContractAndStatements[] = this.rightholderContracts, rightholderId?: string) {
    if (this.readonly) return false;
    const rightholder = rightholderId ? this.shell.waterfall.rightholders.find(r => r.id === rightholderId) : this.shell.currentRightholder;
    return canCreateStatement(type, rightholder, this.producer, contracts, this.shell.canBypassRules);
  }

  public canAddStatement(type: StatementType,) {
    if (!type) return false;
    if (this.shell.canBypassRules) return true;
    if (!this.canCreateStatement(type)) return false;
    const contracts = getContractsWith([this.producer.id, this.shell.currentRightholder.id], this.contracts).filter(c => statementsRolesMapping[type].includes(c.type));
    return contracts.some(c => !this.rightholderContracts.find(rc => rc.id === c.id && rc.statements.length));
  }

}
