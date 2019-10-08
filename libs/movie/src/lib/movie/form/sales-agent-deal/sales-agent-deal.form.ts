import { MovieSalesAgentDeal, createMovieSalesAgentDeal, createRights } from '../../+state';
import { FormEntity, FormField, DateRange } from '@blockframes/utils';

function createRightsFormControl(entity?: Partial<DateRange>) {
  const { from, to } = createRights(entity);
  return {
    from: new FormField(from),
    to: new FormField(to)
  }
}

type RightsFormControl = ReturnType<typeof createRightsFormControl>;

export class RightsForm extends FormEntity<RightsFormControl>{
  constructor(rights?: Partial<DateRange>) {
    super(createRightsFormControl(rights));
  }
}

function createMovieSalesAgentDealControls(salesAgentDeal: Partial<MovieSalesAgentDeal> = {}){
  const entity = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rights: new RightsForm(entity.rights),
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
