import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { Territory, WaterfallSource, Right } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesComponent {
  public sources$ = this.shell.sources$;
  public rights$ = this.shell.rights$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedGroupComponent, {
      data: createModalData({ items: territories, scope: 'territories' }),
      autoFocus: false
    });
  }

  public async removeSources(sources: WaterfallSource[]) {
    await this.waterfallService.removeSources(this.shell.waterfall.id, sources.map(s => s.id));
    this.snackBar.open(`Source${sources.length > 1 ? 's' : ''} ${sources.length === 1 ? sources[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}

@Pipe({ name: 'rightExists' })
export class RightExistsPipe implements PipeTransform {
  transform(id: string, rights: Right[]) {
    return rights.find(r => r.id === id);
  }
}