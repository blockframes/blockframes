// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Statement, filterStatements, sortStatements } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { add, differenceInMonths, endOfMonth, isFirstDayOfMonth, isLastDayOfMonth } from 'date-fns';
import { Subscription } from 'rxjs';

@Component({
  selector: 'waterfall-statement-period',
  templateUrl: './statement-period.component.html',
  styleUrls: ['./statement-period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementPeriodComponent implements OnInit, OnChanges, OnDestroy {
  @Input() form: StatementForm;
  @Input() statement: Statement;

  public periodicity = new FormControl<string>('');
  public periods: Record<string, string> = {
    '12': 'Yearly',
    '6': 'Semesterly',
    '3': 'Quarterly',
    '1': 'Monthly',
    '0': 'Custom'
  };

  public previousStatementId: string;
  public nextStatementId: string;

  private statements: Statement[] = [];
  private sub: Subscription;

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sub = this.periodicity.valueChanges.subscribe(value => {
      if (this.form.get('duration').value.from && value !== '0') {
        const to = add(this.form.get('duration').value.from, { months: +value - 1 });
        this.form.get('duration').get('to').setValue(endOfMonth(to));
      }
    });

    // TODO #9524 subscribe on form duration changes to update periodicity
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async ngOnChanges() {
    this.previousStatementId = undefined;
    this.nextStatementId = undefined;
    if (!this.statements.length) this.statements = await this.shell.statements();
    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    const sortedStatements = sortStatements(filteredStatements);
    const current = sortedStatements.find(s => s.id === this.statement.id).number;
    if (current > 1) this.previousStatementId = sortedStatements.find(s => s.number === current - 1).id;
    if (current < sortedStatements.length) this.nextStatementId = sortedStatements.find(s => s.number === current + 1).id;

    // TODO #9524 set periodicity from previous statement if current does not have dates
    const currentDuration = this.statement.duration;
    if (currentDuration.from && currentDuration.to) {
      let difference = differenceInMonths(currentDuration.to, currentDuration.from);
      if (isFirstDayOfMonth(currentDuration.from) && isLastDayOfMonth(currentDuration.to)) difference++;

      if(this.periods[difference.toString()]) {
        this.periodicity.setValue(difference.toString(), { emitEvent: false });
      } else {
        this.periodicity.setValue('0', { emitEvent: false });
      }
      
    }

    this.cdr.markForCheck();
  }

}
