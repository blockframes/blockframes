// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Statement, filterStatements, sortStatements } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { StatementForm } from '../../form/statement.form';
import { add, differenceInMonths, endOfMonth, isFirstDayOfMonth, isLastDayOfMonth } from 'date-fns';
import { Subscription, filter, map, pairwise } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

function getMonthsDifference(from: Date, to: Date) {
  if (from && to) {
    let difference = differenceInMonths(to, from);
    if (isFirstDayOfMonth(from) && isLastDayOfMonth(to)) difference++;
    return difference;
  }
}

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
  private subs: Subscription[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const periodicitySub = this.periodicity.valueChanges.subscribe(value => {
      if (this.form.get('duration').value.from && value !== '0') {
        const to = add(this.form.get('duration').value.from, { months: +value - 1 });
        this.form.get('duration').get('to').setValue(endOfMonth(to));
        this.form.get('duration').get('to').markAsDirty();
      }
    });
    this.subs.push(periodicitySub);

    const durationSub = this.form.get('duration').valueChanges.pipe(
      pairwise(),
      filter(([prev, curr]) => (curr.from instanceof Date && prev.from?.getTime() !== curr.from.getTime()) || (curr.to instanceof Date && prev.to?.getTime() !== curr.to.getTime())),
      map(([_, curr]) => curr)
    ).subscribe(value => {
      if (value.from instanceof Date && value.to instanceof Date) {
        const difference = getMonthsDifference(value.from, value.to).toString();
        if (this.periods[difference]) {
          this.periodicity.setValue(difference, { emitEvent: false });
        } else {
          this.periodicity.setValue('0', { emitEvent: false });
        }
      }
    });
    this.subs.push(durationSub);

    const versionSub = this.shell.versionId$.subscribe(_ => {
      this.statements = [];
      this.ngOnChanges();
    });

    this.subs.push(versionSub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
  }

  async ngOnChanges() {
    this.previousStatementId = undefined;
    this.nextStatementId = undefined;
    if (!this.statements.length) this.statements = await this.shell.statements();
    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    const sortedStatements = sortStatements(filteredStatements);
    const current = sortedStatements.find(s => s.id === this.statement.id);
    if (!current) return;
    const number = current.number;
    if (number > 1) this.previousStatementId = sortedStatements.find(s => s.number === number - 1).id;
    if (number < sortedStatements.length) this.nextStatementId = sortedStatements.find(s => s.number === number + 1).id;

    const currentDuration = this.statement.duration;
    if (currentDuration.from && currentDuration.to) {
      const difference = getMonthsDifference(currentDuration.from, currentDuration.to).toString();
      if (this.periods[difference]) {
        this.periodicity.setValue(difference, { emitEvent: false });
      } else {
        this.periodicity.setValue('0', { emitEvent: false });
      }
    }

    this.cdr.markForCheck();
  }

  public goTo(id: string) {
    const statementType = this.statement.type;

    if (statementType === 'producer') {
      this.router.navigate(['..', id], { relativeTo: this.route });
    } else {
      this.router.navigate(['../..', id, 'edit'], { relativeTo: this.route });
    }

  }

}
