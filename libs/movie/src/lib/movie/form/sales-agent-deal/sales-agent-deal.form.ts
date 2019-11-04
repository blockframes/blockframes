import { MovieSalesAgentDeal, createMovieSalesAgentDeal } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { DateRange, createDateRange } from '@blockframes/utils/date-range';
import { FormControl } from '@angular/forms';

function createRightsFormControl(entity?: Partial<DateRange>) {
  const { from, to } = createDateRange(entity);
  return {
    from: new FormControl(from),
    to: new FormControl(to)
  }
}

type RightsFormControl = ReturnType<typeof createRightsFormControl>;

export class RightsForm extends FormEntity<RightsFormControl>{
  constructor(rights?: Partial<DateRange>) {
    super(createRightsFormControl(rights));
  }
}

function createMovieSalesAgentDealControls(salesAgentDeal?: Partial<MovieSalesAgentDeal>){
  const { rights, territories, medias, reservedTerritories } = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rights: new RightsForm(rights),
    territories: new FormControl(territories),
    medias: new FormControl(medias),
    reservedTerritories: new FormControl(reservedTerritories),
  }
}

type MovieSalesAgentDealControl = ReturnType<typeof createMovieSalesAgentDealControls>

export class MovieSalesAgentDealForm extends FormEntity<MovieSalesAgentDealControl>{
  constructor(salesAgentDeal?: MovieSalesAgentDeal) {
    super(createMovieSalesAgentDealControls(salesAgentDeal));
  }
}
