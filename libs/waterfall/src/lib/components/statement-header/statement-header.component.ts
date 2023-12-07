// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges } from '@angular/core';

import {
  Statement,
  WaterfallSource,
  getStatementNumber,
  filterStatements,
  WaterfallContract,
  getStatementRightholderTag
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

  private statements: Statement[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnChanges() {
    if (!this.statements.length) this.statements = await this.shell.statements();
    if (!this.contract && !!this.statement.contractId) this.contract = (await this.shell.contracts([this.statement.contractId]))[0];
    const rightholderKey = this.statement.type === 'producer' ? 'receiverId' : 'senderId';
    this.rightholderName = this.shell.waterfall.rightholders.find(r => r.id === this.statement[rightholderKey]).name;

    this.rightholderTag = getStatementRightholderTag(this.statement);

    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    this.statementNumber = getStatementNumber(this.statement, filteredStatements);

    this.cdr.markForCheck();
  }
}
