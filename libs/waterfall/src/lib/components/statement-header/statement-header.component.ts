// Angular
import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import { Statement, WaterfallSource, isDirectSalesStatement, isDistributorStatement, isProducerStatement } from '@blockframes/model';
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

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (isProducerStatement(this.statement)) {
      this.rightholderTag = 'Beneficiary';
      this.rightholderName = this.shell.waterfall.rightholders.find(r => r.id === this.statement.receiverId).name;
    } else if (isDistributorStatement(this.statement)) {
      this.rightholderTag = 'Distributor';
      this.rightholderName = this.shell.waterfall.rightholders.find(r => r.id === this.statement.senderId).name;
    } else if (isDirectSalesStatement(this.statement)) {
      this.rightholderTag = 'Producer';
      this.rightholderName = this.shell.waterfall.rightholders.find(r => r.id === this.statement.senderId).name;
    }
    this.cdr.markForCheck();
  }
}
