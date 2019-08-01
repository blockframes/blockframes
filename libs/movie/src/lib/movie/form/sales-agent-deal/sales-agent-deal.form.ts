import { MovieSalesAgentDeal, createMovieSalesAgentDeal } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createMovieSalesAgentDealControls(salesAgentDeal: Partial<MovieSalesAgentDeal> = {}){
  const entity = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rightsEnd: new FormField<Date>(entity.rightsEnd),
    territories: new FormField(entity.territories),
    medias: new FormField(entity.medias),
  }
}

type MovieSalesAgentDealControl = ReturnType<typeof createMovieSalesAgentDealControls>

export class MovieSalesAgentDealForm extends FormEntity<Partial<MovieSalesAgentDeal>, MovieSalesAgentDealControl>{
  constructor(salesAgentDeal : MovieSalesAgentDeal) {
    super(createMovieSalesAgentDealControls(salesAgentDeal));
  }

}