import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getContractAndAmendments, getCurrentContract, Statement, WaterfallContract } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { firstValueFrom } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent implements OnInit {

  public statements$ = this.shell.statements$;
  private contracts: WaterfallContract[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    this.contracts = await firstValueFrom(this.shell.contracts$);
  }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.shell.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getCurrentContract(item: { contractId: string, date: Date }) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public async removeStatements(statements: Statement[]) {
    const promises = statements.map(statement => this.statementService.remove(statement.id, { params: { waterfallId: statement.waterfallId } }));
    await Promise.all(promises);
    this.snackBar.open(`Statement${statements.length > 1 ? 's' : ''} ${statements.length === 1 ? statements[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}