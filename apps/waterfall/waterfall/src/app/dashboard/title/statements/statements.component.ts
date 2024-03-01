// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, combineLatest, firstValueFrom, startWith } from 'rxjs';
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
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementNewComponent } from '@blockframes/waterfall/components/statement-new/statement-new.component';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  public isRefreshing$ = this.shell.isRefreshing$;

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
      this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} is not defined.`, 'WATERFALL MANAGEMENT', { duration: 5000 })
        .onAction()
        .subscribe(() => {
          this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init'])
        });
      return;
    }

    await this.initTypes(currentRightholder);
    const versionSub = combineLatest([this.shell.versionId$, this.shell.rights$]).subscribe(async ([versionId, rights]) => {
      const version = this.waterfall.versions.find(v => v.id === versionId);
      if (version?.standalone) await this.initTypes(currentRightholder, true);
      if (!rights.find(r => r.rightholderId === this.statementSender.id)) {
        this.snackbar.open(`${toLabel('producer', 'rightholderRoles')} should have at least one receipt share in the waterfall.`, 'WATERFALL MANAGEMENT', { duration: 5000 })
          .onAction()
          .subscribe(() => {
            this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'init'])
          });
      }
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

  public addStatement(type: StatementType) {
    if (!this.isStatementSender) return;
    if (type === 'directSales') return this.createStatement();
    this.dialog.open(StatementNewComponent, {
      data: createModalData({
        type,
        waterfall: this.shell.waterfall,
        producer: this.statementSender,
        contracts: this.contracts,
        statements: this.statements,
        date: this.currentStateDate,
        rights: this.rights,
        onConfirm: async (rightholderId: string, contractId: string) => {
          await this.createStatement(rightholderId, contractId, type);
        }
      })
    });
  }

  public async createStatement(rightholderId?: string, contractId?: string, type = this.selected) {

    /** @dev there should be only one producer */
    const producer = this.waterfall.rightholders.find(r => r.roles.includes('producer'));

    const previousStatement = this.rightholderContracts.find(c => c.id === contractId)?.statements[0];
    const duration = initStatementDuration(this.currentStateDate, previousStatement?.duration);

    const incomeIds = type === 'producer' ?
      (await this.shell.getIncomeIds(this.statementSender.id, rightholderId, contractId, duration.to)) :
      undefined;

    const config: CreateStatementConfig = {
      producerId: producer.id,
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

  public async removeStatement(statement: Statement) {
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
