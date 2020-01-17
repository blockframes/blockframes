import { FormValue, isSlugValidator } from '@blockframes/utils/form';
import { TerritoriesSlug } from '../../../static-model/types';

export class FormCountry extends FormValue<TerritoriesSlug> {
  constructor(country: TerritoriesSlug) {
    super(country, isSlugValidator('TERRITORIES'))
  }
}