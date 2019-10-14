import { MovieSalesAgentDeal, createMovieSalesAgentDeal } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';
import { DateRange, createDateRange } from '@blockframes/utils/date-range';

function createRightsFormControl(entity?: Partial<DateRange>) {
  const { from, to } = createDateRange(entity);
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

function createMovieSalesAgentDealControls(salesAgentDeal?: Partial<MovieSalesAgentDeal>){
  const { rights, territories, medias } = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rights: new RightsForm(rights),
    territories: new FormField(territories),
    medias: new FormField(medias)
  }
}

type MovieSalesAgentDealControl = ReturnType<typeof createMovieSalesAgentDealControls>

export class MovieSalesAgentDealForm extends FormEntity<MovieSalesAgentDealControl>{
  constructor(salesAgentDeal?: MovieSalesAgentDeal) {
    super(createMovieSalesAgentDealControls(salesAgentDeal));
  }
}
