// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ExpenseType, createExpenseType } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { ExpenseTypeForm } from '@blockframes/waterfall/form/document.form';

@Component({
  selector: '[form]waterfall-expense-types',
  templateUrl: './expense-types.component.html',
  styleUrls: ['./expense-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTypesComponent {
  @Input() form: FormList<ExpenseType, ExpenseTypeForm>;

  constructor(
    private documentService: WaterfallDocumentsService,
  ) { }

  add() {
    this.form.add(createExpenseType({ id: this.documentService.createId() }));
  }

  remove(index: number) {
    this.form.removeAt(index);
  }
}
