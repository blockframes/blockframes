
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { Right } from '@blockframes/model';
import { RightService } from '@blockframes/waterfall/right.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

import { WaterfallPoolModalComponent } from '../pool-modal/pool-modal.component';


@Component({
  selector: 'waterfall-right-list',
  templateUrl: './right-list.component.html',
  styleUrls: ['./right-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallRightListComponent implements OnInit, OnDestroy {

  @Input() rights$: Observable<Right[]>;

  @Output() selectRight = new EventEmitter<string>();
  @Output() deleteRight = new EventEmitter<string>();

  rights: Right[] = [];
  rootRights: Right[] = [];
  vMembers: Record<string, Right[]> = {};
  hMembers: Record<string, Right[]> = {};
  searchControl = new FormControl('');
  existingPools = new Set<string>();
  selected = new Set<string>();

  poolsFilter = new Set<string>();

  subs: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private rightService: RightService,
    public shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(this.rights$.subscribe(rights => {
      this.rights = rights;
      this.init(rights);
    }));
    this.subs.push(this.searchControl.valueChanges.subscribe(value => {
      if (value === '') this.init(this.rights);
      else {
        const filteredRights = this.rights.filter(r => r.name.toLowerCase().includes(value.toLowerCase()));
        const groupIds = new Set(filteredRights.filter(r => r.groupId && !filteredRights.map(f => f.id).includes(r.groupId)).map(r => r.groupId).flat());
        groupIds.forEach(id => filteredRights.push(this.rights.find(r => r.id === id)));
        this.init(filteredRights);
      }
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  init(rights: Right[]) {
    this.rootRights = rights.filter(r => !r.groupId);
    this.existingPools = new Set(rights.map(r => r.pools).flat());

    rights.filter(r => r.type === 'vertical').forEach(v => {
      this.vMembers[v.id] = rights.filter(r => r.groupId === v.id).sort((a, b) => a.order - b.order);
    });

    rights.filter(r => r.type === 'horizontal').forEach(h => {
      this.hMembers[h.id] = rights.filter(r => r.groupId === h.id).sort((a, b) => a.order - b.order);
    });
  }

  check(event: MatCheckboxChange, id: string) {
    const right = this.rights.find(r => r.id === id);
    if (!right) return;

    if (event.checked) {
      this.selected.add(right.id);
      if (right.type === 'vertical') this.vMembers[right.id].forEach(r => this.selected.add(r.id));
      else if (right.type === 'horizontal') this.hMembers[right.id].forEach(r => {
        this.selected.add(r.id);
        if (r.type === 'vertical') this.vMembers[r.id].forEach(r => this.selected.add(r.id));
      });

      if (right.groupId) {
        const members = [...(this.vMembers[right.groupId] ?? []), ...(this.hMembers[right.groupId] ?? [])];
        const every = members.every(r => this.selected.has(r.id));
        if (every) this.selected.add(right.groupId);
      }
    } else {
      this.selected.delete(right.id);
      if (right.type === 'vertical') this.vMembers[right.id].forEach(r => this.selected.delete(r.id));
      else if (right.type === 'horizontal') this.hMembers[right.id].forEach(r => {
        this.selected.delete(r.id);
        if (r.type === 'vertical') this.vMembers[r.id].forEach(r => this.selected.delete(r.id));
      });

      if (right.groupId) {
        const members = [...(this.vMembers[right.groupId] ?? []), ...(this.hMembers[right.groupId] ?? [])];
        const every = members.every(r => !this.selected.has(r.id));
        if (every) this.selected.delete(right.groupId);
      }
    }
  }

  isDeterminate(id: string) {
    const right = this.rights.find(r => r.id === id);
    if (!right || (right.type !== 'vertical' && right.type !== 'horizontal') || !this.selected.has(right.id)) return true;

    if (right.type === 'vertical') {
      const members = this.vMembers[right.id];
      return members.every(r => this.selected.has(r.id));
    } else {
      const members = this.hMembers[right.id];
      const subMembers = members.filter(r => r.type === 'vertical').map(r => this.vMembers[r.id]).flat();
      const everyMemberSelected = members.every(r => this.selected.has(r.id));
      const everySubMemberSelected = subMembers.every(r => this.selected.has(r.id));
      return everyMemberSelected && everySubMemberSelected;
    }
  }

  remove(id: string) {
    this.deleteRight.emit(id);
  }

  edit(id: string) {
    this.selectRight.emit(id);
  }

  poolModal() {
    const dialogRef = this.dialog.open(WaterfallPoolModalComponent, { data: { rights: this.rights, selected: this.selected } });
    dialogRef.afterClosed().subscribe(async (result?: { name: string, rightIds: string[] }) => {
      if (!result) return;

      this.rightService.batch();
      const updatedRight = result.rightIds.map(id => this.rights.find(r => r.id === id));
      updatedRight.forEach(r => r.pools.push(result.name));

      await this.rightService.update(updatedRight, { params: { waterfallId: this.shell.waterfall.id } });
    });
  }

  selectFilterPool(pool: string) {
    if (this.poolsFilter.has(pool)) this.poolsFilter.delete(pool);
    else this.poolsFilter.add(pool);

    if (this.poolsFilter.size === 0) {
      this.init(this.rights);
    } else {
      const poolRights = this.rights.filter(r => r.pools.some(p => this.poolsFilter.has(p)));
      this.init(poolRights);
    }
  }

  selectAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.selected = new Set(this.rights.map(r => r.id));
    } else {
      this.selected = new Set<string>();
    }
  }
}
