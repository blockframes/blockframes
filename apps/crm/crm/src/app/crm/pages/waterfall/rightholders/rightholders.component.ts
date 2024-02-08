import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterfallRightholder, } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';

@Component({
  selector: 'crm-rightholders',
  templateUrl: './rightholders.component.html',
  styleUrls: ['./rightholders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightholdersComponent {

  public waterfall$ = this.shell.waterfall$;

  public columns: Record<string, string> = {
    id: 'Id',
    name: 'Organization Name',
    roles: 'Waterfall Roles',
    lockedVersionId: 'Locked Version',
    actions: 'Actions',
  };

  constructor(
    private waterfallService: WaterfallService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public removeRightholders(rightholders: WaterfallRightholder[]) {
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Are you sure?',
        question: 'If you remove a Right Holder, waterfall can break.',
        confirm: `Yes, remove Right Holder${rightholders.length > 1 ? 's' : ''}.`,
        cancel: `No, keep Right Holder${rightholders.length > 1 ? 's' : ''}.`,
        onConfirm: async () => {
          await this.waterfallService.removeRightholders(this.shell.waterfall.id, rightholders.map(s => s.id));
          this.snackBar.open(`Rightholder${rightholders.length > 1 ? 's' : ''} ${rightholders.length === 1 ? rightholders[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }

}