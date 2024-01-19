// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges, EventEmitter, Output } from '@angular/core';

import {
  Statement,
  WaterfallSource,
  getStatementNumber,
  filterStatements,
  WaterfallContract,
  isProducerStatement
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-statement-header',
  templateUrl: './statement-header.component.html',
  styleUrls: ['./statement-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementHeaderComponent implements OnChanges {
  @Input() statement: Statement;
  @Input() sources: WaterfallSource[] = [];
  @Output() versionChanged = new EventEmitter<string>();
  public rightholderName: string;
  public statementNumber: number;
  public contract: WaterfallContract;
  public versionId: string;
  private statements: Statement[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnChanges() {
    if (!this.statements.length) this.statements = await this.shell.statements(this.statement.versionId || this.shell.versionId$.value);
    if (!this.contract && !!this.statement.contractId) this.contract = (await this.shell.contracts([this.statement.contractId]))[0];
    const rightholderKey = this.statement.type === 'producer' ? 'receiverId' : 'senderId';
    const rightholder = this.shell.waterfall.rightholders.find(r => r.id === this.statement[rightholderKey]);

    // Set version to the one of the statement if any and unless a locked version is found for an outgoing statement
    this.versionId = this.statement.versionId;
    if (isProducerStatement(this.statement)) {
      if (rightholder.lockedVersionId && this.shell.waterfall.versions.some(v => v.id === rightholder.lockedVersionId)) {
        this.versionId = rightholder.lockedVersionId;
      }
    }

    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    this.statementNumber = getStatementNumber(this.statement, filteredStatements);

    this.cdr.markForCheck();
  }
}
