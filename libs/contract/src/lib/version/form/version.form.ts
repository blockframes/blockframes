import { FormControl } from '@angular/forms';
import { DistributionDealTermsForm } from '@blockframes/movie/distribution-deals/form/terms/terms.form';
import { createContractTitleDetail } from '@blockframes/contract/contract/+state/contract.model';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { ContractVersionPriceForm } from './price/price.form';
import { ContractVersionPaymentScheduleForm } from './payment-schedule/payment-schedule.form';
import { FormControl } from '@angular/forms';

function createContractVersionControls(contractVersion: Partial<ContractVersion>) {
  return {
    id: new FormControl(contractVersion.id),  // Require or FormList can remove empty Form
    price: new ContractVersionPriceForm(contractVersion.price),
    titles: new ContractVersionTitlesForm(contractVersion.titles),
    scope: new DistributionDealTermsForm(contractVersion.scope),
    paymentSchedule: FormList.factory(contractVersion.paymentSchedule, payment => {
      return new ContractVersionPaymentScheduleForm(payment)
    }),
    customPaymentSchedule: new FormControl(contractVersion.customPaymentSchedule),
    paymentTerm: new DistributionDealTermsForm(contractVersion.paymentTerm)
  }
}

type ContractVersionControl = ReturnType<typeof createContractVersionControls>;

export class ContractVersionForm extends FormEntity<ContractVersionControl, ContractVersion> {
  constructor(contractVersion: Partial<ContractVersion> = {}) {
    super(createContractVersionControls(contractVersion));
  }
}
// Contract Titles

function createContractTitlesControls(
  titles: Record<string, Partial<ContractTitleDetail>>
): ContractTitlesControl {
  const controls = {};
  for (const id in titles) {
    controls[id] = new ContractTitleDetailForm(titles[id]);
  }
  return controls;
}

export type ContractTitlesControl = Record<string, ContractTitleDetailForm>;
type ContractTitles = Record<string, ContractTitleDetail>

export class ContractVersionTitlesForm extends FormEntity<ContractTitlesControl, ContractTitles> {
  constructor(titleDetail: Record<string, Partial<ContractTitleDetail>> = {}) {
    super(createContractTitlesControls(titleDetail));
  }
}

// Contract Title Details

function createContractTitleDetailControl(detail?: Partial<ContractTitleDetail>) {
  const entity = createContractTitleDetail(detail);
  return {
    distributionDealIds: FormList.factory(entity.distributionDealIds),
    price: new ContractVersionPriceForm(entity.price)
  };
}

type ContractTitleDetailControl = ReturnType<typeof createContractTitleDetailControl>;

export class ContractTitleDetailForm extends FormEntity<ContractTitleDetailControl, ContractTitleDetail> {
  constructor(detail?: Partial<ContractTitleDetail>) {
    super(createContractTitleDetailControl(detail));
  }
}