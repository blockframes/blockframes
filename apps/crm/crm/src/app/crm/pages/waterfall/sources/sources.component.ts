import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Territory, WaterfallSource, Right } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesComponent implements OnInit {
  public waterfall$ = this.shell.waterfall$;
  private rights: Right[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.rights =await firstValueFrom(this.shell.rights$);
  }

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

  public rightExists(id: string) {
    return this.rights.find(r => r.id === id);
  }

}