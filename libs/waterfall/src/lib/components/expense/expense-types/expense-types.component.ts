// Angular
import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';

import { ExpenseType, createExpenseType } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { WaterfallDocumentsService } from '../../../documents.service';
import { ExpenseTypeForm } from '../../../form/document.form';

@Component({
  selector: '[form]waterfall-expense-types',
  templateUrl: './expense-types.component.html',
  styleUrls: ['./expense-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTypesComponent implements OnChanges {
  @Input() form: FormList<ExpenseType, ExpenseTypeForm>;
  @Input() versionId = 'default';

  constructor(
    private documentService: WaterfallDocumentsService,
  ) { }

  ngOnChanges() {
    if (this.versionId === 'default') {
      this.form.enable();
    } else {
      this.form.disable();
      for (const item of this.form.controls) {
        item.get('cap').enable();
      }
    }
  }

  add() {
    this.form.add(createExpenseType({ id: this.documentService.createId() }));
  }

  remove(index: number) {
    this.form.removeAt(index);
  }
}
