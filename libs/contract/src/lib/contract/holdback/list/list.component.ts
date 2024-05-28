import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Scope, Holdback } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'holdback-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() holdbacks: Holdback[] = [];

  constructor(private dialog: MatDialog) { }

  openDetails(items: string, scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }
}
