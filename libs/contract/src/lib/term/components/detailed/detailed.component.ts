import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Scope, StaticGroup, staticGroups } from '@blockframes/utils/static-model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'contract-detailed-terms',
  templateUrl: 'detailed.component.html',
  styleUrls: ['./detailed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailedTermsComponent implements OnInit {
  groups$ = new BehaviorSubject<StaticGroup[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { terms: string[], scope: Scope },
    public dialogRef: MatDialogRef<DetailedTermsComponent>
  ) {}

  ngOnInit() {
    const groups = staticGroups[this.data.scope]
    if (!!groups) {
      for (const group of groups) {
        group.items = group.items.filter(item => this.data.terms.includes(item));
      }
      this.groups$.next(groups);
    }
  }
}
