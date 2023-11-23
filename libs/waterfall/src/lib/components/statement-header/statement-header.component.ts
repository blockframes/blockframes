// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnChanges } from '@angular/core';

import {
  Statement,
  WaterfallSource,
  getStatementNumber,
  filterStatements,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement,
  WaterfallContract
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

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

    if (isProducerStatement(this.statement)) {
      this.rightholderTag = 'Beneficiary';
    } else if (isDistributorStatement(this.statement)) {
      this.rightholderTag = 'Distributor';
    } else if (isDirectSalesStatement(this.statement)) {
      this.rightholderTag = 'Producer';
    }

    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, this.statements);
    this.statementNumber = getStatementNumber(this.statement, filteredStatements);

    this.cdr.markForCheck();
  }
}
