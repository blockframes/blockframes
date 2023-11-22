// Angular
import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import {
  Statement,
  WaterfallSource,
  getStatementNumber,
  filterStatements,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-statement-header',
  templateUrl: './statement-header.component.html',
  styleUrls: ['./statement-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementHeaderComponent implements OnInit {
  @Input() statement: Statement;
  @Input() sources: WaterfallSource[] = [];
  public rightholderTag: string;
  public rightholderName: string;
  public statementNumber: number;

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const statements = await this.shell.statements();
    const rightholderKey = this.statement.type === 'producer' ? 'receiverId' : 'senderId';
    this.rightholderName = this.shell.waterfall.rightholders.find(r => r.id === this.statement[rightholderKey]).name;

    if (isProducerStatement(this.statement)) {
      this.rightholderTag = 'Beneficiary';
    } else if (isDistributorStatement(this.statement)) {
      this.rightholderTag = 'Distributor';
    } else if (isDirectSalesStatement(this.statement)) {
      this.rightholderTag = 'Producer';
    }

    const filteredStatements = filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, statements);
    this.statementNumber = getStatementNumber(this.statement, filteredStatements);

    this.cdr.markForCheck();
  }
}
