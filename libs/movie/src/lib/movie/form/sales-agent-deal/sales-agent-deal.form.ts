import { MovieSalesAgentDeal, createMovieSalesAgentDeal, Movie } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createMovieSalesAgentDealControls(salesAgentDeal: Partial<MovieSalesAgentDeal> = {}){
  const entity = createMovieSalesAgentDeal(salesAgentDeal);
  return {
    rights: new FormEntity<Movie['salesAgentDeal']['rights']>({
      from: new FormField(entity.rights.from),
      to: new FormField(entity.rights.to),
    }),
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
