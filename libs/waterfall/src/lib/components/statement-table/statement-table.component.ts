import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, Pipe, PipeTransform } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  Income,
  Statement,
  Waterfall,
  getDefaultVersionId,
  getIncomesSources,
  isDistributorStatement,
  isProducerStatement
} from '@blockframes/model';
import { StatementPaymentComponent } from '../statement-payment/statement-payment.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { StatementService } from '../../statement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'waterfall-statement-table',
  templateUrl: './statement-table.component.html',
  styleUrls: ['./statement-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementTableComponent {
  @Input() statements: Statement[] = [];
  @Input() columns: Record<string, string> = {
    number: '#',
    duration: 'Statement period',
    due: 'Amount Due',
    paid: 'Amount Paid',
    date: 'Payment Date',
    status: 'Reported',
    actions: 'Actions',
  };
  @Input() actions: Record<string, boolean> = {
    notify: true,
    edit: true,
    download: true,
    view: true,
    payment: true
  };
  @Output() delete = new EventEmitter<Statement>();
  @Input() @boolean defaultSort = false;

  public waterfall = this.shell.waterfall;
  public contracts$ = this.shell.contracts$;
  public incomes$ = this.shell.incomes$;
  public sorts = sorts;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private statementService: StatementService,
  ) { }

  payment(statement: Statement) {
    const versionId = getDefaultVersionId(this.waterfall); // TODO #9520 versionId via statement.versionId ?
    if (versionId) this.shell.setVersionId(versionId);

    this.dialog.open(StatementPaymentComponent, {
      data: createModalData({
        statement,
        movie: this.shell.movie,
        waterfall: this.shell.waterfall,
        onConfirm: async (paymentDate: Date) => {
          if (!isDistributorStatement(statement) && !isProducerStatement(statement)) return;
          statement.payments.rightholder.status = 'received';
          statement.payments.rightholder.date = paymentDate;

          // Validate all external "right" payments and set payment date
          statement.payments.right = statement.payments.right.map(p => ({
            ...p,
            status: p.mode === 'external' ? 'received' : p.status,
            date: p.mode === 'external' ? paymentDate : p.date
          }));

          await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });
          await this.shell.refreshWaterfall();

          this.snackBar.open('Statement marked as paid !', 'close', { duration: 5000 });
        }
      })
    });
  }
}

@Pipe({ name: 'incomesSources' })
export class IncomesSourcesPipe implements PipeTransform {
  transform(incomeIds: string[], _incomes: Income[], waterfall: Waterfall) {
    const incomes = _incomes?.filter(i => incomeIds.includes(i.id)) || [];
    return getIncomesSources(incomes, waterfall.sources);
  }
}