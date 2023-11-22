// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Statement, filterStatements, sortStatements } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';

@Component({
  selector: 'waterfall-statement-period',
  templateUrl: './statement-period.component.html',
  styleUrls: ['./statement-period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementPeriodComponent implements OnChanges {
  @Input() form: StatementForm;
  @Input() statement: Statement;

  public periodicity = new FormControl<string>('semesterly');
  public periods: string[] = ['semesterly', 'yearly', 'quarterly', 'monthly'];

  public previousStatementId: string;
  public nextStatementId: string;

  private statements: Statement[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

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

    this.cdr.markForCheck();
  }

}
