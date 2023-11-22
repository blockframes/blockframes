
import { FormControl, FormGroup } from '@angular/forms';
import { Statement } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';

function createStatementFormControl(statement?: Partial<Statement>) {
  return {
    duration: new FormGroup({
      from: new FormControl<Date>(statement?.duration.from ?? new Date()),
      to: new FormControl<Date>(statement?.duration?.to ?? new Date()),
    }),
    reported: new FormControl<Date>(statement?.reported ?? new Date()),
  }
}

type StatementFormControl = ReturnType<typeof createStatementFormControl>;

export class StatementForm extends FormEntity<StatementFormControl> {
  constructor(statement?: Partial<Statement>) {
    super(createStatementFormControl(statement));
  }
}