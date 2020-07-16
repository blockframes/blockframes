import { createMovieProduction } from '../+state';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { StakeholderMapForm } from './main/main.form';
import { MovieProduction } from '../+state/movie.firestore';

function createMovieProductionControls(production?: Partial<MovieProduction>) {
  const entity = createMovieProduction(production);
  return {
    stakeholders: new StakeholderMapForm(entity.stakeholders),  }
}

export type MovieProductionControl = ReturnType<typeof createMovieProductionControls>

export class MovieProductionForm extends FormEntity<MovieProductionControl>{

  constructor(production?: MovieProduction) {
    super(createMovieProductionControls(production));
  }

  get stakeholders() {
    return this.get('stakeholders');
  }

}
