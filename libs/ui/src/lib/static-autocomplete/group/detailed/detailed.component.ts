import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { GroupScope, StaticGroup, staticGroups } from '@blockframes/model';

@Component({
  selector: 'group-detailed',
  templateUrl: 'detailed.component.html',
  styleUrls: ['./detailed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailedGroupComponent implements OnInit {
  groups$ = new BehaviorSubject<StaticGroup[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { items: string[], scope: GroupScope },
    public dialogRef: MatDialogRef<DetailedGroupComponent>
  ) { }

  ngOnInit() {
    const groups = JSON.parse(JSON.stringify(staticGroups[this.data.scope] ?? {}));
    if (groups) {
      for (const group of groups) {

        const fullGroup = this.data.items.includes(group.label);
        if (!fullGroup) {
          group.items = group.items.filter(item => this.data.items.includes(item));
        }
      }
      this.groups$.next(groups);
    }
  }

  close() {
    this.dialogRef.close()
  }
}
