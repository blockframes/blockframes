
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { RightService } from '@blockframes/waterfall/right.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

import { WaterfallPoolModalComponent } from '../pool-modal/pool-modal.component';
import { Right } from '@blockframes/model';


@Component({
  selector: 'waterfall-pool-list',
  templateUrl: './pool-list.component.html',
  styleUrls: ['./pool-list.component.scss'] 
})
export class WaterfallPoolListComponent implements OnInit, OnDestroy {

  rights: Right[] = [];
  existingPools = new Set<string>();

  sub: Subscription;

  constructor(
    private dialog: MatDialog,
    private rightService: RightService,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.sub = this.shell.rights$.subscribe(rights => {
      this.rights = rights;
      this.existingPools = new Set(rights.map(r => r.pools).flat());
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  removePool(pool: string) {
    const rights = this.rights.map(r => ({ ...r, pools: r.pools.filter(p => p !== pool) }));
    this.rightService.update(rights, { params: { waterfallId: this.shell.waterfall.id } });
  }

  editPool(oldName: string) {
    const selected = new Set(this.rights.filter(r => r.pools.includes(oldName)).map(r => r.id));
    this.dialog.open(
      WaterfallPoolModalComponent,
      {
        data: {
          rights: this.rights,
          selected,
          name: oldName,
          onConfirm: async ({ name, rightIds }: { name: string, rightIds: string[] }) => {

            const rights = this.rights.map(r => ({ ...r, pools: r.pools.filter(p => p !== oldName) }));
            rights.forEach(r => {
              if (rightIds.includes(r.id)) r.pools.push(name);
            });

            await this.rightService.update(rights, { params: { waterfallId: this.shell.waterfall.id } });
          },
        },
      },
    );
  }
}
