
import { FormControl } from '@angular/forms';

import { WaterfallFileForm } from './file.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { RightholderRole, Term, WaterfallFile } from '@blockframes/model';
import { BucketTermForm } from '@blockframes/contract/bucket/form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { creatTermControl } from '@blockframes/contract/negotiation';

export interface WaterfallContractFormValue {
  id: string;
  licenseeName: string;
  licenseeRole: RightholderRole[];

  licensorName: string;
  licensorRole: RightholderRole[];

  signatureDate: Date;
  startDate: Date;
  endDate: Date;

  price: number;

  hasRights: boolean;
  terms: Term[];

  file: WaterfallFile;
}

function createWaterfallContractFormControl(contract: (Partial<WaterfallContractFormValue> & { id: string })) {
  return {
    licenseeName: new FormControl(contract.licenseeName ?? ''),
    licenseeRole: new FormControl<RightholderRole[]>(contract.licenseeRole ?? []),

    licensorName: new FormControl(contract.licensorName ?? ''),
    licensorRole: new FormControl<RightholderRole[]>(contract.licensorRole ?? []),

    signatureDate: new FormControl(contract.signatureDate ?? new Date()),
    startDate: new FormControl(contract.startDate ??  new Date()),
    endDate: new FormControl(contract.endDate ??  new Date()),

    price: new FormControl(contract.price ?? 0),

    hasRights: new FormControl(contract.hasRights ?? true),
    terms: FormList.factory(contract.terms, term => BucketTermForm.factory(term, creatTermControl)),

    file: new WaterfallFileForm({ ...contract.file, id: contract.id }),
  };
}

type WaterfallContractFormControl = ReturnType<typeof createWaterfallContractFormControl>;

export class WaterfallContractForm extends FormEntity<WaterfallContractFormControl> {
  constructor(contract: (Partial<WaterfallContractFormValue> & { id: string })) {
    const control = createWaterfallContractFormControl(contract);
    super(control);
  }
}
