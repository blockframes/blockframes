
// Angular
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { map } from 'rxjs';

// Blockframes
import { createExpenseType, ExpenseType, getDefaultVersionId, isDefaultVersion, Waterfall } from '@blockframes/model';
import { ExpenseTypeForm } from '../../../form/contract.form';
import { FormList } from '@blockframes/utils/form';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { WaterfallService } from '../../../waterfall.service';

@Component({
  selector: '[contractId] waterfall-expense-types-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTypesFormComponent implements OnInit {

  @Input() contractId: string;
  public versionId$ = this.shell.versionId$.pipe(map(versionId => (!versionId || isDefaultVersion(this.shell.waterfall, versionId)) ? 'default' : versionId));
  private versions = this.shell.waterfall.versions.map(v => v.id).filter(id => id !== getDefaultVersionId(this.shell.waterfall));
  public form = FormList.factory<ExpenseType, ExpenseTypeForm>([], expenseType => new ExpenseTypeForm(expenseType, this.versions));
  public waterfall$ = this.shell.waterfall$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
  ) { }

  ngOnInit() {
    if (this.shell.waterfall.expenseTypes[this.contractId]?.length > 0) {
      this.shell.waterfall.expenseTypes[this.contractId].forEach(expenseType => this.form.add(expenseType));
    } else {
      this.form.add(createExpenseType({ contractId: this.contractId }));
    }
  }

  save(waterfall: Waterfall) {
    const { expenseTypes, id } = waterfall;
    const expenseType = this.form.getRawValue().filter(c => !!c.name).map(c => createExpenseType({
      ...c,
      contractId: this.contractId,
      id: c.id || this.waterfallService.createId(),
    }));
    expenseTypes[this.contractId] = expenseType;

    return this.waterfallService.update({ id, expenseTypes });
  }

}
