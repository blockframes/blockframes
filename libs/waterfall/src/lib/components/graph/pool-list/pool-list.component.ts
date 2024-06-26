import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform } from '@angular/core';
import { map, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Right } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { RightService } from '../../../right.service';
import { WaterfallPoolModalComponent } from '../pool-modal/pool-modal.component';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-pool-list',
  templateUrl: './pool-list.component.html',
  styleUrls: ['./pool-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallPoolListComponent {

  @Input() public nonEditableNodeIds: string[] = [];

  public rights: Right[] = [];
  public existingPools$ = this.shell.rights$.pipe(
    tap(rights => this.rights = rights),
    map(rights => new Set(rights.map(r => r.pools).flat()))
  );

  constructor(
    private dialog: MatDialog,
    private rightService: RightService,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  removePool(pool: string) {
    const rightIds = this.rights.filter(r => r.pools.includes(pool)).map(r => r.id);
    if (this.nonEditableNodeIds.some(id => rightIds.includes(id))) return;
    const rights = this.rights.map(r => ({ ...r, pools: r.pools.filter(p => p !== pool) }));
    this.rightService.update(rights, { params: { waterfallId: this.shell.waterfall.id } });
  }

  editPool(oldName: string) {
    const rightIds = this.rights.filter(r => r.pools.includes(oldName)).map(r => r.id);
    if (this.nonEditableNodeIds.some(id => rightIds.includes(id))) return;
    const selected = new Set(this.rights.filter(r => r.pools.includes(oldName)).map(r => r.id));
    this.dialog.open(
      WaterfallPoolModalComponent,
      {
        data: createModalData({
          rights: this.rights.filter(r => !this.nonEditableNodeIds.includes(r.id)),
          selected,
          name: oldName,
          onConfirm: async ({ name, rightIds }: { name: string, rightIds: string[] }) => {

            const rights = this.rights.map(r => ({ ...r, pools: r.pools.filter(p => p !== oldName) }));
            rights.forEach(r => {
              if (rightIds.includes(r.id)) r.pools.push(name);
            });

            await this.rightService.update(rights, { params: { waterfallId: this.shell.waterfall.id } });
          }
        })
      }
    );
  }
}

@Pipe({ name: 'canUpdatePool' })
export class CanUpdatePoolPipe implements PipeTransform {
  transform(poolId: string, rights: Right[], nonEditableNodeIds: string[] = []) {
    const rightIds = rights.filter(r => r.pools.includes(poolId)).map(r => r.id);
    return !nonEditableNodeIds.some(id => rightIds.includes(id));
  }
}