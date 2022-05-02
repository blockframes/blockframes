import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Scope, Holdback } from '@blockframes/model';
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

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: createModalData({ terms, scope }), autoFocus: false });
  }
}
