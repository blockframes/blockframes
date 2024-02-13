import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  Income,
  Statement,
  StatementPdfParams,
  Waterfall,
  getDefaultVersionId,
  getIncomesSources,
  isDistributorStatement,
  isProducerStatement,
  toLabel
} from '@blockframes/model';
import { StatementPaymentComponent } from '../statement-payment/statement-payment.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { StatementService } from '../../statement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DownloadStatementSettings, PdfService } from '@blockframes/utils/pdf.service';
import { CallableFunctions } from 'ngfire';
import { StatementShareComponent } from '../statement-share/statement-share.component';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthService } from '@blockframes/auth/service';

function statementFileName(statement: Statement & { number: number }) {
  return `${toLabel(statement.type, 'statementType')} Statement ${statement.number}`;
}

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
    status: 'Status',
    actions: 'Actions',
  };
  @Input() actions: Record<string, boolean> = {
    notify: true,
    edit: true,
    share: true,
    download: true,
    view: true,
    payment: true,
    deleteDraft: true,
    certify: true,
  };
  @Output() delete = new EventEmitter<Statement>();
  @Input() @boolean defaultSort = false;

  public waterfall = this.shell.waterfall;
  public contracts$ = this.shell.contracts$;
  public incomes$ = this.shell.incomes$;
  public sorts = sorts;
  public canBypassRules$ = this.shell.canBypassRules$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private statementService: StatementService,
    private pdfService: PdfService,
    private orgService: OrganizationService,
    private authService: AuthService,
    private functions: CallableFunctions,
    private cdr: ChangeDetectorRef,
  ) { }

  payment(statement: Statement) {
    const versionId = statement.versionId || getDefaultVersionId(this.waterfall);
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
          await this.shell.refreshAllWaterfalls();

          this.statements = this.statements.map(s => s.id === statement.id ? statement : s);

          this.snackBar.open('Statement marked as paid !', 'close', { duration: 5000 });
          this.cdr.markForCheck();
        }
      })
    });
  }

  async download(statement: Statement & { number: number }) {
    const settings: DownloadStatementSettings = {
      statement: statement,
      waterfallId: this.waterfall.id,
      number: statement.number,
      versionId: statement.versionId,
      fileName: statementFileName(statement)
    };
    const snackbarRef = this.snackBar.open('Please wait, your statement is being generated...');

    const exportStatus = await this.pdfService.downloadStatement(settings);
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackBar.open('An error occurred, please try again.', 'close', { duration: 5000 });
    }
  }

  async share(statement: Statement & { number: number }) {
    const request: StatementPdfParams = {
      statementId: statement.id,
      waterfallId: this.waterfall.id,
      number: statement.number,
      versionId: statement.versionId,
      org: this.orgService.org,
      fileName: statementFileName(statement)
    };

    this.dialog.open(StatementShareComponent, {
      data: createModalData({
        statement,
        waterfall: this.shell.waterfall,
        movie: this.shell.movie,
        onConfirm: async (emails: string[]) => {
          const emailStr = emails.length === 1 ? `"${emails[0]}"` : `${emails.length} emails`;
          const snackbarRef = this.snackBar.open(`Please wait, statement is being sent to ${emailStr} ...`);

          const output = await this.functions.call<{ request: StatementPdfParams, emails: string[] }, boolean>('statementToEmail', { request, emails });
          snackbarRef.dismiss();
          if (!output) {
            this.snackBar.open('An error occurred, please try again.', 'close', { duration: 5000 });
          } else {
            this.snackBar.open('Your Statement has been successfully shared.', 'close', { duration: 5000 });
          }
        }
      })
    });
  }

  async certify(statement: Statement & { number: number }) {
    if (statement.hash?.requested) return;
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Certify the document via Blockchain',
        question: 'Objective of Blockchain timestamping is to have proof of reissue made, certify a digital document.',
        advice: 'For any question, please',
        intercom: 'Contact us',
        confirm: 'Certify document',
        cancel: 'Close window',
        onConfirm: async () => {
          statement.hash.requested = true;
          statement.hash.requestDate = new Date();
          statement.hash.requestedBy = this.authService.user.uid;
          await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });
          this.snackBar.open('Request sent, we\'ll get back to you shortly.', 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
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

