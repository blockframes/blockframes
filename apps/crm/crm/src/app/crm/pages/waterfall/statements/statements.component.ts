import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Statement } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent {

  public statements$ = this.shell.statements$;
  public waterfall = this.shell.waterfall;
  public contracts$ = this.shell.contracts$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public async removeStatements(statements: Statement[]) {
    const promises = statements.map(statement => this.statementService.remove(statement.id, { params: { waterfallId: statement.waterfallId } }));
    await Promise.all(promises);
    this.snackBar.open(`Statement${statements.length > 1 ? 's' : ''} ${statements.length === 1 ? statements[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}