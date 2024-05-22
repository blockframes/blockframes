import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Right } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RightService } from '@blockframes/waterfall/right.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightsComponent {
  public rights$ = this.shell.rights$;
  public waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private rightService: RightService,
    private snackBar: MatSnackBar,
  ) { }

  public async removeRights(rights: Right[]) {
    const promises = rights.map(right => this.rightService.remove(right.id, { params: { waterfallId: this.shell.waterfall.id } }));
    await Promise.all(promises);
    this.snackBar.open(`Right${rights.length > 1 ? 's' : ''} ${rights.length === 1 ? rights[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}