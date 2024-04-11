import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Right } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { RightService } from '../../../right.service';
import { WaterfallPoolModalComponent } from '../pool-modal/pool-modal.component';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-right-list',
  templateUrl: './right-list.component.html',
  styleUrls: ['./right-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallRightListComponent implements OnInit, OnDestroy {

  @Input() public nonEditableNodeIds: string[] = [];
  @Input() @boolean public canCreatePool = true;

  @Output() selectRight = new EventEmitter<string>();
  @Output() deleteRight = new EventEmitter<string>();

  public rights: Right[] = [];
  public rootRights: Right[] = [];
  public vMembers: Record<string, Right[]> = {};
  public hMembers: Record<string, Right[]> = {};
  public searchControl = new FormControl('');
  public existingPools = new Set<string>();
  public selected = new Set<string>();
  public poolsFilter = new Set<string>();

  private subs: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private rightService: RightService,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(this.shell.rights$.subscribe(rights => {
      this.selected = new Set<string>();
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
    if (this.nonEditableNodeIds.includes(id)) return;
    this.deleteRight.emit(id);
  }

  edit(id: string) {
    if (this.nonEditableNodeIds.includes(id)) return;
    this.selectRight.emit(id);
  }

  poolModal() {
    if (!this.canCreatePool) return;
    this.dialog.open(
      WaterfallPoolModalComponent,
      {
        data: {
          rights: this.rights.filter(r => !this.nonEditableNodeIds.includes(r.id)),
          selected: this.selected,
          onConfirm: async ({ name, rightIds }: { name: string, rightIds: string[] }) => {
            this.rightService.batch();
            const updatedRight = rightIds.map(id => this.rights.find(i => i.id === id));
            console.log(this.rights.length, updatedRight, rightIds);
            updatedRight.forEach(j => j.pools.push(name));

            await this.rightService.update(updatedRight, { params: { waterfallId: this.shell.waterfall.id } });
          }
        }
      }
    );
  }

  selectFilterPool(pool: string) {
    if (this.poolsFilter.has(pool)) this.poolsFilter.delete(pool);
    else this.poolsFilter.add(pool);

    if (this.poolsFilter.size === 0) {
      this.init(this.rights);
    } else {
      const poolRights = this.rights.filter(r => r.pools.some(p => this.poolsFilter.has(p)));
      const groups = new Set(poolRights.map(r => r.groupId));
      const filteredRightIds = new Set([...poolRights.map(r => r.id), ...groups]);
      const filteredRights = this.rights.filter(r => filteredRightIds.has(r.id));
      this.init(filteredRights);
    }
  }

  selectAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.selected = new Set(this.rights.map(r => r.id).filter(id => !this.nonEditableNodeIds.includes(id)));
    } else {
      this.selected = new Set<string>();
    }
  }
}
