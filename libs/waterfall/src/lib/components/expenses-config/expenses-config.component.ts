// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ExpensesConfig, createExpensesConfig } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { ExpensesConfigForm } from '@blockframes/waterfall/form/document.form';

@Component({
  selector: '[form]waterfall-expenses-config',
  templateUrl: './expenses-config.component.html',
  styleUrls: ['./expenses-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesConfigComponent {
  @Input() form: FormList<ExpensesConfig, ExpensesConfigForm>;

  constructor(
    private documentService: WaterfallDocumentsService,
  ) { }

  add() {
    this.form.add(createExpensesConfig({ id: this.documentService.createId() }));
  }

  remove(index: number) {
    this.form.removeAt(index);
  }
}
