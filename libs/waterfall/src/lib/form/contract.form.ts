
import { FormControl, FormGroup, FormRecord, UntypedFormControl, Validators } from '@angular/forms';

import { WaterfallFileForm } from './file.form';

import { FormList } from '@blockframes/utils/form/forms/list.form';
import { BucketTermForm, createBucketTermControl } from '@blockframes/contract/bucket/form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import {
  BucketTerm,
  ExpenseType,
  MovieCurrency,
  RightholderRole,
  Term,
  WaterfallFile,
  WaterfallInvestment,
  mainCurrency
} from '@blockframes/model';
import { compareDates } from '@blockframes/utils/form';

export function createExpenseTypeControl(config?: Partial<ExpenseType>, versionIds: string[] = []) {

  const defaultValue = config?.cap?.default ?? 0;
  const version = {};
  for (const id of versionIds) {
    version[id] = new FormControl<number>(config.cap.version[id] ?? defaultValue);
  }
  return {
    id: new FormControl<string>(config?.id ?? ''),
    name: new FormControl<string>(config?.name ?? ''),
    currency: new FormControl<string>(config?.currency ?? mainCurrency),
    cap: new FormGroup({
      default: new FormControl<number>(defaultValue),
      version: new FormRecord(version)
    })
  };
}

type ExpenseTypeControl = ReturnType<typeof createExpenseTypeControl>;

export class ExpenseTypeForm extends FormEntity<ExpenseTypeControl> {
  constructor(config?: Partial<ExpenseType>, versionIds: string[] = []) {
    super(createExpenseTypeControl(config, versionIds));
  }
}

export function createWaterfallInvestmentControl(config?: Partial<WaterfallInvestment>) {
  return {
    value: new FormControl(config?.value ?? 0),
    date: new FormControl<Date>(config?.date),
  };
}

type WaterfallInvestmentControl = ReturnType<typeof createWaterfallInvestmentControl>;

export class WaterfallInvestmentForm extends FormEntity<WaterfallInvestmentControl> {
  constructor(config?: Partial<WaterfallInvestment>) {
    super(createWaterfallInvestmentControl(config));
  }
}

export interface WaterfallContractFormValue {
  id: string;
  name: string;
  licenseeName: string;
  licenseeRole: RightholderRole[];

  licensorName: string;
  licensorRole: RightholderRole[];

  signatureDate: Date;
  startDate: Date;
  endDate: Date;

  currency: MovieCurrency;
  price: WaterfallInvestment[];

  terms: Term[];

  file: WaterfallFile;

  expenseTypes: ExpenseType[];
}

export const creatWaterfallTermControl = (term: Partial<BucketTerm | Term> = {}) => {
  const fromValidators = [compareDates('from', 'to', 'from'), Validators.required];
  const toValidators = [compareDates('from', 'to', 'to'), Validators.required];
  return ('id' in term)
    ? { ...createBucketTermControl(term, fromValidators, toValidators), id: new UntypedFormControl(term.id) }
    : createBucketTermControl(term, fromValidators, toValidators);
}

function createWaterfallContractFormControl(contract: (Partial<WaterfallContractFormValue> & { id: string })) {
  const signatureDateValidators = [
    compareDates('signatureDate', 'endDate', 'signatureDate', 'signatureOverEnd'),
    compareDates('signatureDate', 'startDate', 'signatureDate', 'signatureOverStart'),
    Validators.required
  ];
  const startDateValidators = [
    compareDates('signatureDate', 'startDate', 'startDate', 'signatureOverStart'),
    compareDates('startDate', 'endDate', 'startDate'),
    Validators.required
  ];
  const endDateValidators = [
    compareDates('signatureDate', 'endDate', 'endDate', 'signatureOverEnd'),
    compareDates('startDate', 'endDate', 'endDate'),
    Validators.required
  ];
  return {
    id: new FormControl(contract.id),
    name: new FormControl(contract.name ?? ''),
    licenseeName: new FormControl(contract.licenseeName ?? ''),
    licenseeRole: new FormControl<RightholderRole[]>(contract.licenseeRole ?? []),

    licensorName: new FormControl(contract.licensorName ?? ''),
    licensorRole: new FormControl<RightholderRole[]>(contract.licensorRole ?? []),

    signatureDate: new FormControl(contract.signatureDate ?? new Date(), signatureDateValidators),
    startDate: new FormControl(contract.startDate ?? new Date(), startDateValidators),
    endDate: new FormControl(contract.endDate ?? new Date(), endDateValidators),

    currency: new FormControl<MovieCurrency>(contract.currency ?? mainCurrency),
    price: FormList.factory(contract?.price, c => WaterfallInvestmentForm.factory(c, createWaterfallInvestmentControl)),

    terms: FormList.factory(contract.terms, term => BucketTermForm.factory(term, creatWaterfallTermControl)),

    file: new WaterfallFileForm({ ...contract.file, id: contract.id }),

    expenseTypes: FormList.factory(contract?.expenseTypes, c => ExpenseTypeForm.factory(c, createExpenseTypeControl)),
  };
}

type WaterfallContractFormControl = ReturnType<typeof createWaterfallContractFormControl>;

export class WaterfallContractForm extends FormEntity<WaterfallContractFormControl> {
  constructor(contract: (Partial<WaterfallContractFormValue> & { id: string })) {
    const control = createWaterfallContractFormControl(contract);
    super(control);
  }

  reset(data: Partial<WaterfallContractFormValue>) {
    super.reset();
    this.patchValue({
      id: data.id,
      name: data.name || '',
      licenseeName: data.licenseeName || '',
      licenseeRole: data.licenseeRole || [],
      licensorName: data.licensorName || '',
      licensorRole: data.licensorRole || [],
      signatureDate: data.signatureDate || new Date(),
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      file: data.file || { id: data.id },
      currency: data.currency || mainCurrency,
    });
    this.controls.terms.patchAllValue(data.terms || []);
    this.controls.expenseTypes.patchAllValue(data.expenseTypes || []);
    this.controls.price.patchAllValue(data.price || []);
    this.markAsPristine();
  }
}
