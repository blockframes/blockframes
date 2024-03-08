
import { FormControl } from '@angular/forms';
import { WaterfallFileForm } from './file.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { WaterfallFile } from '@blockframes/model';

export interface WaterfallBudgetFormValue {
  id: string;
  file: WaterfallFile;
}

function createWaterfallBudgetFormControl(budget: (Partial<WaterfallBudgetFormValue> & { id: string })) {
  return {
    id: new FormControl(budget.id),
    file: new WaterfallFileForm({ ...budget.file, id: budget.id }),
  };
}

type WaterfallBudgetFormControl = ReturnType<typeof createWaterfallBudgetFormControl>;

export class WaterfallBudgetForm extends FormEntity<WaterfallBudgetFormControl> {
  constructor(budget: (Partial<WaterfallBudgetFormValue> & { id: string })) {
    const control = createWaterfallBudgetFormControl(budget);
    super(control);
  }

  reset(data: Partial<WaterfallBudgetFormValue>) {
    super.reset();
    this.patchValue({
      id: data.id,
      file: data.file || { id: data.id },
    });
    this.markAsPristine();
  }
}
