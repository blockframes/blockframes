import { Component, ChangeDetectionStrategy, Input, OnChanges, ChangeDetectorRef, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import {
  Income,
  Right,
  Statement,
  WaterfallContract,
  WaterfallRightholder,
  getOutgoingStatementPrerequists,
  isProducerStatement,
  sortStatements
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription, filter, firstValueFrom, map, pairwise, startWith } from 'rxjs';
import { StatementForm } from '../../../form/statement.form';
import { unique } from '@blockframes/utils/helpers';

@Component({
  selector: 'waterfall-incoming-statements',
  templateUrl: './incoming-statements.component.html',
  styleUrls: ['./incoming-statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingStatementComponent implements OnInit, OnChanges, OnDestroy {

  @Input() statement: Statement;
  @Input() form: StatementForm;
  @Output() incomeIds = new EventEmitter<string[]>();

  public reportableStatements: (Statement & { number: number })[] = [];
  public distributors: WaterfallRightholder[] = [];
  public distributorContracts: Record<string, WaterfallContract[]> = {};

  public contractControl = new FormControl<string>('');
  public formArray = new FormArray([]);

  private statements: Statement[] = [];
  private contracts: WaterfallContract[] = [];
  private rights: Right[] = [];
  private incomes: Income[] = [];
  private sub: Subscription;
  private dateSub: Subscription;

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sub = this.formArray.valueChanges.subscribe(value => {
      const checkedStatements: string[] = value.filter(s => s.checked).map(s => s.id);
      const incomes = checkedStatements.map(s => this.statements.find(statement => statement.id === s).incomeIds).flat();
      this.incomeIds.emit(incomes);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.dateSub?.unsubscribe();
  }

  async ngOnChanges() {

    if (!this.statements.length) this.statements = await this.shell.statements();
    if (!this.contracts.length) this.contracts = await this.shell.contracts();
    if (!this.rights.length) this.rights = await this.shell.rights();
    if (!this.incomes.length) this.incomes = await this.shell.incomes();

    const date$ = this.form.get('duration').get('to').valueChanges.pipe(
      pairwise(),
      filter(([prev, curr]) => curr instanceof Date && prev?.getTime() !== curr.getTime()),
      map(([_, curr]) => curr)
    );

    this.dateSub = date$.pipe(startWith(this.form.get('duration').get('to').value)).subscribe(async date => {
      const state = await firstValueFrom(this.shell.simulation$);

      const config = {
        senderId: this.statement.senderId,
        receiverId: this.statement.receiverId,
        statements: this.statements.filter(s => s.id !== this.statement.id),
        contracts: this.contracts,
        rights: this.rights,
        titleState: state.waterfall.state,
        incomes: this.incomes,
        sources: this.shell.waterfall.sources,
        date,
      };

      const prerequists = getOutgoingStatementPrerequists(config);
      const reportableIncomes = prerequists[this.statement.contractId]?.incomeIds || [];

      const filteredStatements = this.statements.filter(s => s.id !== this.statement.id && !isProducerStatement(s));
      const reportableStatements = filteredStatements.filter(s => s.incomeIds.some(id => reportableIncomes.includes(id)));
      const distributorStatements = filteredStatements.filter(s => s.incomeIds.some(id => this.statement.incomeIds.includes(id)));

      const distributorsIds = unique(reportableStatements.map(s => s.senderId));
      this.distributors = this.shell.waterfall.rightholders.filter(r => distributorsIds.includes(r.id));

      this.formArray.clear();
      this.distributorContracts = {};

      for (const statement of reportableStatements) {
        if (statement.contractId) {
          if (!this.distributorContracts[statement.senderId]) {
            this.distributorContracts[statement.senderId] = [this.contracts.find(c => c.id === statement.contractId)];
          } else if (!this.distributorContracts[statement.senderId].some(c => c.id === statement.contractId)) {
            this.distributorContracts[statement.senderId].push(this.contracts.find(c => c.id === statement.contractId));
          }
        }
      }

      this.reportableStatements = [];
      for (const distributor of this.distributors) {
        if (!this.distributorContracts[distributor.id]) {
          const distributorStms = sortStatements(filteredStatements.filter(s => s.senderId === distributor.id), false);
          const filteredDistributorStatements = distributorStms.filter(s => reportableStatements.some(stm => stm.id === s.id));
          this.reportableStatements = [...this.reportableStatements, ...filteredDistributorStatements];
        } else {
          for (const contract of this.distributorContracts[distributor.id]) {
            const distributorStms = sortStatements(filteredStatements.filter(s => s.senderId === distributor.id && s.contractId === contract.id), false);
            const filteredDistributorStatements = distributorStms.filter(s => reportableStatements.some(stm => stm.id === s.id));
            this.reportableStatements = [...this.reportableStatements, ...filteredDistributorStatements];
          }
        }
      }

      for (const statement of this.reportableStatements) {
        this.formArray.push(new FormGroup({
          id: new FormControl<string>(statement.id),
          checked: new FormControl<boolean>(distributorStatements.some(s => s.id === statement.id))
        }), { emitEvent: false });
      }

      this.formArray.updateValueAndValidity({ emitEvent: true });

      this.onTabChanged({ index: 0 });
      this.cdr.markForCheck();
    });

  }

  onTabChanged({ index }: { index: number }) {
    if (!this.distributors[index]) return;
    const distributor = this.distributors[index];
    if (this.distributorContracts[distributor.id]?.length) {
      this.contractControl.setValue(this.distributorContracts[distributor.id][0].id);
    } else {
      this.contractControl.setValue('');
    }
  }

}
