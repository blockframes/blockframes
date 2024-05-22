import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Statement } from '@blockframes/model';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'crm-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent {

  public statements$ = this.shell.statements$;

  public columns: Record<string, string> = {
    id: 'Id',
    type: 'Type',
    versionId: 'Version',
    contract: 'Contract',
    sender: 'Sender',
    receiver: 'Receiver',
    duration: 'Statement period',
    status: 'Status',
    actions: 'Actions',
  };

  public actions: Record<string, boolean> = {
    notify: false,
    edit: false,
    download: false,
    view: false,
    payment: true,
    delete: true,
    crm: true,
  };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  public removeStatements(statements: Statement[]) {
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Are you sure?',
        question: 'If you remove a reported statement, waterfall can break.',
        confirm: `Yes, remove statement${statements.length > 1 ? 's' : ''}.`,
        cancel: `No, keep statement${statements.length > 1 ? 's' : ''}.`,
        onConfirm: async () => {
          const promises = statements.map(statement => this.statementService.remove(statement.id, { params: { waterfallId: statement.waterfallId } }));
          await Promise.all(promises);
          this.snackBar.open(`Statement${statements.length > 1 ? 's' : ''} ${statements.length === 1 ? statements[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }

}