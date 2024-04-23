import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Movie, Scope, Term, Waterfall, WaterfallContract } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'waterfall-contract-main-info',
  templateUrl: './contract-main-info.component.html',
  styleUrls: ['./contract-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractMainInfoComponent {

  @Input() contract: WaterfallContract & { terms: Term[] };
  @Input() movie: Movie;
  @Input() waterfall: Waterfall;

  constructor(
    private dialog: MatDialog,
  ) { }

  public openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }
}
