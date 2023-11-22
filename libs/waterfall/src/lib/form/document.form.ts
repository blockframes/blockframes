
import { FormControl } from '@angular/forms';

import { WaterfallFileForm } from './file.form';

import { FormList } from '@blockframes/utils/form/forms/list.form';
import { BucketTermForm } from '@blockframes/contract/bucket/form';
import { creatTermControl } from '@blockframes/contract/negotiation';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { RightholderRole, Term, WaterfallFile } from '@blockframes/model';


export interface WaterfallDocumentFormValue {
  id: string;
  name: string;
  licenseeName: string;
  licenseeRole: RightholderRole[];

  licensorName: string;
  licensorRole: RightholderRole[];

  signatureDate: Date;
  startDate: Date;
  endDate: Date;

  price: number;

  terms: Term[];

  file: WaterfallFile;
}

function createWaterfallDocumentFormControl(contract: (Partial<WaterfallDocumentFormValue> & { id: string })) {
  return {
    id: new FormControl(contract.id),
    name: new FormControl(contract.name ?? ''),
    licenseeName: new FormControl(contract.licenseeName ?? ''),
    licenseeRole: new FormControl<RightholderRole[]>(contract.licenseeRole ?? []),

    licensorName: new FormControl(contract.licensorName ?? ''),
    licensorRole: new FormControl<RightholderRole[]>(contract.licensorRole ?? []),

    signatureDate: new FormControl(contract.signatureDate ?? new Date()),
    startDate: new FormControl(contract.startDate ?? new Date()),
    endDate: new FormControl(contract.endDate ?? new Date()),

    price: new FormControl(contract.price ?? 0),

    terms: FormList.factory(contract.terms, term => BucketTermForm.factory(term, creatTermControl)),

    file: new WaterfallFileForm({ ...contract.file, id: contract.id }),
  };
}

type WaterfallDocumentFormControl = ReturnType<typeof createWaterfallDocumentFormControl>;

export class WaterfallDocumentForm extends FormEntity<WaterfallDocumentFormControl> {
  constructor(contract: (Partial<WaterfallDocumentFormValue> & { id: string })) {
    const control = createWaterfallDocumentFormControl(contract);
    super(control);
  }

  reset(data: Partial<WaterfallDocumentFormValue>) {
    super.reset();
    this.patchValue({
      id: data.id,
      name: data.name || '',
      licenseeName: data.licenseeName || '',
      licenseeRole: data.licenseeRole || [],
      licensorName: data.licensorName || '',
      licensorRole: data.licenseeRole || [],
      signatureDate: data.signatureDate || new Date(),
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      price: data.price || 0,
      file: data.file || { id: data.id },
      terms: data.terms || [],
    });
    this.markAsPristine();
  }
}
