import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterfallRightholder, } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-rightholders',
  templateUrl: './rightholders.component.html',
  styleUrls: ['./rightholders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightholdersComponent {

  public waterfall$ = this.shell.waterfall$;

  constructor(
    private waterfallService: WaterfallService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public async removeRightholders(rightholders: WaterfallRightholder[]) {
    await this.waterfallService.removeRightholders(this.shell.waterfall.id, rightholders.map(s => s.id));
    this.snackBar.open(`Rightholder${rightholders.length > 1 ? 's' : ''} ${rightholders.length === 1 ? rightholders[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}