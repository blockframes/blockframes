import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import {
  Statement,
  WaterfallContract,
  WaterfallRightholder,
  getOutgoingStatementPrerequists,
  isProducerStatement,
  sortStatements
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription, combineLatest, filter, firstValueFrom, map, pairwise, startWith } from 'rxjs';
import { StatementForm } from '../../../form/statement.form';
import { unique } from '@blockframes/utils/helpers';

@Component({
  selector: 'waterfall-incoming-statements',
  templateUrl: './incoming-statements.component.html',
  styleUrls: ['./incoming-statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingStatementComponent implements OnInit, OnDestroy {

  @Input() private set statement(statement: Statement) {
    this.statement$.next(statement);
  }
  public statement$ = new BehaviorSubject<Statement>(null);

  @Input() form: StatementForm;
  @Output() incomeIds = new EventEmitter<string[]>();

  public reportableStatements: (Statement & { number: number })[] = [];
  public distributors: WaterfallRightholder[] = [];
  public distributorContracts: Record<string, WaterfallContract[]> = {};

  public contractControl = new FormControl<string>('');
  public formArray = new FormArray([]);

  private subs: Subscription[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const statements = await this.shell.statements();
    const contracts = await this.shell.contracts();
    const rights = await this.shell.rights();
    const incomes = await this.shell.incomes();

    const formArraySub = this.formArray.valueChanges.pipe(
      pairwise(),
      filter(([prev, curr]) => {
        const prevChecked = prev?.filter(s => s.checked).map(s => s.id) || [];
        const currChecked = curr.filter(s => s.checked).map(s => s.id);
        return prevChecked.length !== currChecked.length || prevChecked.some(id => !currChecked.includes(id));
      }),
      map(([_, curr]) => curr)
    ).subscribe(value => {
      const checkedStatements: string[] = value.filter(s => s.checked).map(s => s.id);
      const incomes = checkedStatements.map(s => statements.find(statement => statement.id === s).incomeIds).flat();
      this.incomeIds.emit(incomes);
    });

    const date$ = this.form.get('duration').get('to').valueChanges.pipe(
      pairwise(),
      filter(([prev, curr]) => curr instanceof Date && prev?.getTime() !== curr.getTime()),
      map(([_, curr]) => curr),
      startWith(this.form.get('duration').get('to').value),
      filter(date => date instanceof Date)
    );
    this.subs.push(formArraySub);

    const statementSub = combineLatest([date$, this.statement$]).subscribe(async ([date, statement]) => {
      this.distributors = [];
      const state = await firstValueFrom(this.shell.simulation$);

      const config = {
        senderId: statement.senderId,
        receiverId: statement.receiverId,
        statements: statements.filter(s => s.id !== statement.id),
        contracts,
        rights,
        titleState: state.waterfall.state,
        incomes,
        sources: this.shell.waterfall.sources,
        date,
      };

      const prerequists = getOutgoingStatementPrerequists(config);
      const reportableIncomes = prerequists[statement.contractId]?.incomeIds || [];

      const filteredStatements = statements.filter(s => s.id !== statement.id && !isProducerStatement(s));
      const reportableStatements = filteredStatements.filter(s => s.incomeIds.some(id => reportableIncomes.includes(id)));
      const distributorsIds = unique(reportableStatements.map(s => s.senderId));
      this.distributors = this.shell.waterfall.rightholders.filter(r => distributorsIds.includes(r.id));

      this.formArray.clear({ emitEvent: false });
      this.distributorContracts = {};

      for (const statement of reportableStatements) {
        if (statement.contractId) {
          if (!this.distributorContracts[statement.senderId]) {
            this.distributorContracts[statement.senderId] = [contracts.find(c => c.id === statement.contractId)];
          } else if (!this.distributorContracts[statement.senderId].some(c => c.id === statement.contractId)) {
            this.distributorContracts[statement.senderId].push(contracts.find(c => c.id === statement.contractId));
          }
        }
      }

      this.reportableStatements = [];
      for (const distributor of this.distributors) {
        if (!this.distributorContracts[distributor.id]) {
          const distributorStatements = sortStatements(filteredStatements.filter(s => s.senderId === distributor.id), false);
          const filteredDistributorStatements = distributorStatements.filter(s => reportableStatements.some(stm => stm.id === s.id));
          this.reportableStatements = [...this.reportableStatements, ...filteredDistributorStatements];
        } else {
          for (const contract of this.distributorContracts[distributor.id]) {
            const distributorStatements = sortStatements(filteredStatements.filter(s => s.senderId === distributor.id && s.contractId === contract.id), false);
            const filteredDistributorStatements = distributorStatements.filter(s => reportableStatements.some(stm => stm.id === s.id));
            this.reportableStatements = [...this.reportableStatements, ...filteredDistributorStatements];
          }
        }
      }

      const checkedStatements = reportableStatements.filter(s => s.incomeIds.some(id => statement.incomeIds.includes(id)));
      for (const statement of this.reportableStatements) {
        this.formArray.push(new FormGroup({
          id: new FormControl<string>(statement.id),
          checked: new FormControl<boolean>(checkedStatements.some(s => s.id === statement.id))
        }), { emitEvent: false });
      }

      this.formArray.updateValueAndValidity({ emitEvent: true });

      this.onTabChanged({ index: 0 });
      this.cdr.markForCheck();
    });

    this.subs.push(statementSub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
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

  markAsDirty() {
    if (this.statement$.value.status !== 'reported') this.form.markAsDirty();
  }

}
