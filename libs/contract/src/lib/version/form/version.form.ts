import { DistributionDealTermsForm } from '@blockframes/movie/distribution-deals/form/terms/terms.form';
import { createContractTitleDetail } from '@blockframes/contract/contract/+state/contract.model';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { ContractVersionPriceForm } from './price/price.form';
import { ContractVersionPaymentScheduleForm } from './payment-schedule/payment-schedule.form';

function createContractVersionControls(contractVersion: Partial<ContractVersion>) {
  return {
    price: new ContractVersionPriceForm(contractVersion.price),
    titles: new ContractVersionTitlesForm(contractVersion.titles),
    scope: new DistributionDealTermsForm(contractVersion.scope),
    paymentSchedule: FormList.factory(contractVersion.paymentSchedule, payment => {
      return new ContractVersionPaymentScheduleForm(payment)
    })
  }
}

type ContractVersionControl = ReturnType<typeof createContractVersionControls>;

export class ContractVersionForm extends FormEntity<ContractVersionControl> {
  constructor(contractVersion: Partial<ContractVersion> = {}) {
    super(createContractVersionControls(contractVersion));
  }
}
// Contract Titles

function createContractTitlesControls(
  titles: Record<string, Partial<ContractTitleDetail>>
): ContractTitlesControl {
  const controls = {};
  const ids = Object.keys(titles);
  for (const id in ids) {
    controls[id] = new ContractTitleDetailForm(titles[id]);
  }
  return controls;
}

type ContractTitlesControl = Record<string, ContractTitleDetailForm>;

export class ContractVersionTitlesForm extends FormEntity<ContractTitlesControl> {
  constructor(titleDetail: Record<string, Partial<ContractTitleDetail>> = {}) {
    super(createContractTitlesControls(titleDetail));
  }
}

// Contract Title Details

function createContractTitleDetailControl(detail?: Partial<ContractTitleDetail>) {
  const entity = createContractTitleDetail(detail);
  return {
    distributionDealIds: FormList.factory(entity.distributionDealIds)
  };
}

type ContractTitleDetailControl = ReturnType<typeof createContractTitleDetailControl>;

export class ContractTitleDetailForm extends FormEntity<ContractTitleDetailControl> {
  constructor(detail?: Partial<ContractTitleDetail>) {
    super(createContractTitleDetailControl(detail));
  }
}
