import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Statement, Territory, WaterfallSource } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';

const incomeColumns = {
  medias: 'Medias',
  territories: 'Territories',
  '': 'Price',
}

const expenseColumns = {
  type: 'Type',
  category: 'Category',
  '': 'Price',
}

@Component({
  selector: 'waterfall-statement-distributor-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDistributorEditComponent {

  @Input() statement: Statement;
  @Input() form: StatementForm;
  @Input() sources: WaterfallSource[];

  public incomeColumns = incomeColumns;
  public expenseColumns = expenseColumns;

  constructor(private dialog: MatDialog) { }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedGroupComponent, {
      data: createModalData({ items: territories, scope: 'territories' }),
      autoFocus: false
    });
  }

  public defaultIncomeValue(source: WaterfallSource) {
    return { medias: source.medias, territories: source.territories };
  }

  public defaultExpenseValue() {
    return { type: 'type', category: 'category' };
  }
}