import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Statement, Territory, WaterfallSource } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementForm } from '../../../form/statement.form';

const incomeColumns = {
  medias: $localize`Medias`,
  territories: $localize`Territories`,
  '': $localize`Amount`,
}

@Component({
  selector: '[statement][form][sources] waterfall-income-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeFormComponent {

  @Input() statement: Statement;
  @Input() form: StatementForm;
  @Input() sources: WaterfallSource[] = [];

  public incomeColumns = incomeColumns;
  public sourcesControl = new FormControl<string[]>([]);

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

}