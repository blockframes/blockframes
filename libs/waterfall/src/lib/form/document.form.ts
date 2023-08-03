
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { WaterfallFileForm } from './file.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Media, RightholderRole, Term, Territory, WaterfallFile } from '@blockframes/model';


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
  const terms = contract.terms?.map(term => new FormGroup({
    medias: new FormControl<Media[]>(term.medias ?? []),
    territories: new FormControl<Territory[]>(term.territories ?? []),
    exclusive: new FormControl(term.exclusive ?? false),
  })) ?? [];
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
    terms: new FormArray(terms),

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
