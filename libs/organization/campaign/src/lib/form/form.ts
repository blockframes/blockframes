import { FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { Campaign, createCampaign, Perk, createPerk } from '../+state/campaign.model';

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


//////////
// PERK //
//////////

function createPerkControls(value?: Partial<Perk>) {
  const perk = createPerk(value);
  return {
    title: new FormControl(perk.title, [Validators.required]),
    description: new FormControl(perk.description, Validators.required),
    minPledge: new FormControl(perk.minPledge),
    amount: new FormEntity({
      current: new FormControl(perk.amount.current),
      total: new FormControl(perk.amount.total, Validators.required),
    })
  };
}

type PerkControls = ReturnType<typeof createPerkControls>;

export class PerkForm extends FormEntity<PerkControls, Perk> {
  constructor(value?: Partial<Perk>) {
    const controls = createPerkControls(value);
    super(controls, comparePerkAmount);
  }
}

//////////////
// CAMPAIGN //
//////////////

function createCampaignControls(value?: Partial<Campaign>) {
  const campaign = createCampaign(value);
  return {
    cap: new FormControl(campaign.cap, [Validators.required, Validators.min(0)]),
    minPledge: new FormControl(campaign.minPledge, [Validators.required, Validators.min(0)]),
    received: new FormControl(campaign.received),
    perks: FormList.factory(
      campaign.perks,
      (perk?: Partial<Perk>) => new PerkForm(perk),
    ),
  }
}

export type CampaignControls = ReturnType<typeof createCampaignControls>;

export class CampaignForm extends FormEntity<CampaignControls, Campaign> {

  constructor(value?: Partial<Campaign>) {
    const controls = createCampaignControls(value);
    super(controls, [compareMinPledge, compareReceived]);
  }

  setAllValue(campaign: Partial<Campaign> = {}) {
    const controls = createCampaignControls(campaign);
    for (const key in controls) {
      if (key in this.controls) {
        this.controls[key].patchValue(controls[key].value)
      } else {
        this.setControl(key as any, controls[key]);
      }
    }
  }
}
