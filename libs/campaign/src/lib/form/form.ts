import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { FormEntity, FormList, FormStaticValue } from '@blockframes/utils/form';
import { Campaign, createCampaign, Perk, createPerk, Funding, Budget } from '../+state/campaign.model';

///////////////
// VALIDATOR //
///////////////
export function compareMinPledge(form: CampaignForm): ValidationErrors | null {
  return form?.value.cap < form?.value.minPledge
    ? { minPledgeOverflow: true }
    : null
};

function compareReceived(form: CampaignForm): ValidationErrors | null {
  return form?.value.cap < form?.value.received
    ? { receivedOverflow: true }
    : null
}

export function comparePerkAmount(form: PerkForm): ValidationErrors | null {
  const control = form.get('amount');
  if (control) {
    return control?.value.total < control?.value.current
      ? { amountOverflow: true }
      : null
  }
};

function compareProfits(form: FormGroup): ValidationErrors | null {
  const { low, medium, high } = form.value;
  const errors = {};
  if (low && medium && low > medium) errors['lowOverMedium'] = true;
  if (low && high && low > high) errors['lowOverHigh'] = true;
  if (medium && high && medium > high) errors['mediumOverHigh'] = true;
  return Object.keys(errors).length ? errors : null;
}


//////////
// PERK //
//////////

function createPerkControls(value?: Partial<Perk>) {
  const perk = createPerk(value);
  return {
    title: new FormControl(perk.title, [Validators.required]),
    description: new FormControl(perk.description, Validators.required),
    minPledge: new FormControl(perk.minPledge, [Validators.min(0)]),
    amount: new FormEntity({
      current: new FormControl(perk.amount.current, [Validators.min(0)]),
      total: new FormControl(perk.amount.total, [Validators.required, Validators.min(0)]),
    })
  };
}

type PerkControls = ReturnType<typeof createPerkControls>;

export class PerkForm extends FormEntity<PerkControls, Perk> {
  constructor(value?: Partial<Perk>) {
    const controls = createPerkControls(value);
    super(controls);
  }
}


/////////////
// FUNDING //
/////////////
function createFundingControls(funding: Partial<Funding> = {}) {
  return {
    name: new FormControl(funding.name),
    amount: new FormControl(funding.amount, Validators.min(0)),
    kind: new FormControl(funding.kind),
    status: new FormControl(funding.status),
  }
}

type FundingControls = ReturnType<typeof createFundingControls>;

export class FundingForm extends FormEntity<FundingControls, Funding> {
  constructor(value?: Partial<Funding>) {
    const controls = createFundingControls(value);
    super(controls);
  }
}


////////////
// BUDGET //
////////////
function createBudgetFormControl(budget: Partial<Budget> = {}) {
  return {
    development: new FormControl(budget.development, Validators.min(0)),
    administration: new FormControl(budget.administration, Validators.min(0)),
    contingency: new FormControl(budget.contingency, Validators.min(0)),
    postProduction: new FormControl(budget.postProduction, Validators.min(0)),
    shooting: new FormControl(budget.shooting, Validators.min(0))
  }
}

export type BudgetFormControl = ReturnType<typeof createBudgetFormControl>;

export class BudgetForm extends FormEntity<BudgetFormControl> {
  constructor(budget?: Partial<Budget>) {
    super(createBudgetFormControl(budget));
  }
}


//////////////
// CAMPAIGN //
//////////////

function createCampaignControls(value?: Partial<Campaign>) {
  const campaign = createCampaign(value);
  return {
    currency: new FormStaticValue(campaign.currency, 'movieCurrencies', [Validators.required]),
    cap: new FormControl(campaign.cap, [Validators.required, Validators.min(0)]),
    minPledge: new FormControl(campaign.minPledge, [Validators.required, Validators.min(0)]),
    received: new FormControl(campaign.received, Validators.min(0)),
    profits: new FormGroup({
      low: new FormControl(campaign.profits.low, Validators.min(0)),
      medium: new FormControl(campaign.profits.medium, Validators.min(0)),
      high: new FormControl(campaign.profits.high, Validators.min(0)),
    }, compareProfits),
    perks: FormList.factory(
      campaign.perks,
      (perk?: Partial<Perk>) => new PerkForm(perk),
    ),
    fundings: FormList.factory(
      campaign.fundings,
      (funding?: Partial<Funding>) => new FundingForm(funding),
    ),
    budget: new BudgetForm(campaign.budget),
    files: new FormGroup({
      financingPlan: new StorageFileForm(campaign.files.financingPlan),
      waterfall: new StorageFileForm(campaign.files.waterfall),
      budget: new StorageFileForm(campaign.files.budget),
    })
  }
}

export type CampaignControls = ReturnType<typeof createCampaignControls>;

export class CampaignForm extends FormEntity<CampaignControls, Campaign> {

  constructor(value?: Partial<Campaign>) {
    const controls = createCampaignControls(value);
    super(controls, [compareMinPledge, compareReceived]);
  }

  getCurrency() {
    return this.get('currency').value;
  }

  setAllValue(campaign: Partial<Campaign> = {}) {
    const controls = createCampaignControls(campaign);
    for (const key in controls) {
      if (this.contains(key)) {
        const control = this.get(key as keyof CampaignControls);
        const value = controls[key].value;
        if (control instanceof FormList) {
          control.patchAllValue(value);
        } else {
          control.patchValue(value);
        }
      } else {
        this.addControl(key, controls[key]);
      }
    }
  }
}
