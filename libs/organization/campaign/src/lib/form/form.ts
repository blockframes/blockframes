import { FormControl, Validators } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { Campaign, createCampaign, Perk, createPerk } from '../+state/campaign.model';

//////////
// PERK //
//////////

function createPerkControls(value?: Partial<Perk>) {
  const perk = createPerk(value);
  return {
    title: new FormControl(perk.title, Validators.required),
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
    super(controls);
  }
}

//////////////
// CAMPAIGN //
//////////////

function createCampaignControls(value?: Partial<Campaign>) {
  const campaign = createCampaign(value);
  return {
    cap: new FormControl(campaign.cap, Validators.required),
    minPledge: new FormControl(campaign.minPledge, Validators.required),
    received: new FormControl(campaign.received),
    perks: FormList.factory(campaign.perks, (perk?: Partial<Perk>) => new PerkForm(perk)),
  }
}

type CampaignControls = ReturnType<typeof createCampaignControls>;

export class CampaignForm extends FormEntity<CampaignControls, Campaign> {
  constructor(value?: Partial<Campaign>) {
    const controls = createCampaignControls(value);
    super(controls);
  }
}