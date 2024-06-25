// Angular
import { Component, ChangeDetectionStrategy, Input, OnChanges, OnInit } from '@angular/core';

import { ExpenseType, Waterfall, createExpenseType } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { WaterfallDocumentsService } from '../../../documents.service';
import { ExpenseTypeForm } from '../../../form/contract.form';

@Component({
  selector: '[form]waterfall-expense-types',
  templateUrl: './expense-types.component.html',
  styleUrls: ['./expense-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTypesComponent implements OnInit, OnChanges {
  @Input() form: FormList<ExpenseType, ExpenseTypeForm>;
  @Input() versionId = 'default';
  @Input() waterfall: Waterfall;
  public addExpenseType = $localize`Add Expense Type`;
  public deleteExpenseType = $localize`Delete Expense Type`;

  constructor(
    private documentService: WaterfallDocumentsService,
  ) { }

  ngOnInit() {
    this.addExpenseType = this.versionId === 'default' ? $localize`Add Expense Type` : $localize`Not permitted`;
    this.deleteExpenseType = this.versionId === 'default' ? $localize`Delete Expense Type` : $localize`Not permitted`;
  }

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
