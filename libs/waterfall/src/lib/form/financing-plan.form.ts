
import { FormControl } from '@angular/forms';
import { WaterfallFileForm } from './file.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { WaterfallFile } from '@blockframes/model';

export interface WaterfallFinancingPlanFormValue {
  id: string;
  file: WaterfallFile;
}

function createWaterfallFinancingPlanFormControl(financingPlan: (Partial<WaterfallFinancingPlanFormValue> & { id: string })) {
  return {
    id: new FormControl(financingPlan.id),
    file: new WaterfallFileForm({ ...financingPlan.file, id: financingPlan.id }),
  };
}

type WaterfallFinancingPlanFormControl = ReturnType<typeof createWaterfallFinancingPlanFormControl>;

export class WaterfallFinancingPlanForm extends FormEntity<WaterfallFinancingPlanFormControl> {
  constructor(financingPlan: (Partial<WaterfallFinancingPlanFormValue> & { id: string })) {
    const control = createWaterfallFinancingPlanFormControl(financingPlan);
    super(control);
  }

  reset(data: Partial<WaterfallFinancingPlanFormValue>) {
    super.reset();
    this.patchValue({
      id: data.id,
      file: data.file || { id: data.id },
    });
    this.markAsPristine();
  }
}
