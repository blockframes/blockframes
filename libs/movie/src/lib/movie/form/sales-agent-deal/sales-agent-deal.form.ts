import { MovieSalesAgentDeal, createMovieSalesAgentDeal } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createRightsFormControl(entity : Partial<MovieSalesAgentDeal> = {}) {
  return {
    from: new FormField(entity.rights.from),
    to: new FormField(entity.rights.to)
  }
}

type RightsFormControl = ReturnType<typeof createRightsFormControl>;

export class RightsForm extends FormEntity<RightsFormControl>{
  constructor(salesAgentDeal : Partial<MovieSalesAgentDeal>) {
    super(createRightsFormControl(salesAgentDeal));
  }
}

function createMovieSalesAgentDealControls(salesAgentDeal: Partial<MovieSalesAgentDeal> = {}){
  const entity = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rights: new RightsForm(entity),
    territories: new FormField(entity.territories),
    medias: new FormField(entity.medias),
  }
}

type MovieSalesAgentDealControl = ReturnType<typeof createMovieSalesAgentDealControls>

export class MovieSalesAgentDealForm extends FormEntity<MovieSalesAgentDealControl>{
  constructor(salesAgentDeal : MovieSalesAgentDeal) {
    super(createMovieSalesAgentDealControls(salesAgentDeal));
  }
}
