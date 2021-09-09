import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import { GroupScope, StaticGroup, staticGroups } from '@blockframes/utils/static-model';

@Component({
  selector: 'contract-detailed-terms',
  templateUrl: 'detailed.component.html',
  styleUrls: ['./detailed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailedTermsComponent implements OnInit {
  groups$ = new BehaviorSubject<StaticGroup[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { terms: string[], scope: GroupScope },
    public dialogRef: MatDialogRef<DetailedTermsComponent>
  ) { }

  ngOnInit() {
    const groups = JSON.parse(JSON.stringify(staticGroups[this.data.scope]));
    if (groups) {
      for (const group of groups) {

        // if a term is the name of a group, we want to keep all the territories
        // i.e. we don't want to filter
        const fullGroup = this.data.terms.includes(group.label);
        if (!fullGroup) {
          group.items = group.items.filter(item => this.data.terms.includes(item));
        }
      }
      this.groups$.next(groups);
    }
  }

  close() {
    this.dialogRef.close()
  }
}
