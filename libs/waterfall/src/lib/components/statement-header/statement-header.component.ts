// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges } from '@angular/core';

import {
  Statement,
  WaterfallSource,
  getStatementNumber,
  filterStatements,
  WaterfallContract,
  getStatementRightholderTag,
  isProducerStatement,
  getDefaultVersionId
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
  public rightholderTag: string;
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
    if (!this.statements.length) this.statements = await this.shell.statements();
    if (!this.contract && !!this.statement.contractId) this.contract = (await this.shell.contracts([this.statement.contractId]))[0];
    const rightholderKey = this.statement.type === 'producer' ? 'receiverId' : 'senderId';
    const rightholder = this.shell.waterfall.rightholders.find(r => r.id === this.statement[rightholderKey]);
    this.rightholderName = rightholder.name;

    // Set version to default, unless a locked version is found for an outgoing statement
    this.versionId = getDefaultVersionId(this.shell.waterfall);
    if (isProducerStatement(this.statement)) {
      if (rightholder.lockedVersionId && this.shell.waterfall.versions.some(v => v.id === rightholder.lockedVersionId)) {
        this.versionId = rightholder.lockedVersionId;
      }
    }

    this.rightholderTag = getStatementRightholderTag(this.statement);

    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    this.statementNumber = getStatementNumber(this.statement, filteredStatements);

    this.cdr.markForCheck();
  }
}
