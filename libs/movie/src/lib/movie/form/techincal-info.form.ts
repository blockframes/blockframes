import { FormEntity, FormStaticValue } from '@blockframes/utils/form';
import { MovieSalesInfo } from '../+state';

function createMovieTechnicalInfoControl(salesInfo: Partial<MovieSalesInfo>) {
  return {
    color: new FormStaticValue(salesInfo.color, 'COLORS'),
    format: new FormStaticValue(salesInfo.format, 'MOVIE_FORMAT'),
    quality: new FormStaticValue(salesInfo.formatQuality, 'MOVIE_FORMAT_QUALITY'),
    sound: new FormStaticValue(salesInfo.soundFormat, 'SOUND_FORMAT'),
  }
}

type MovieTechnicalInfoControl = ReturnType<typeof createMovieTechnicalInfoControl>;

export class MovieTechnicalInfoForm extends FormEntity<MovieTechnicalInfoControl> {
  constructor(salesInfo: MovieSalesInfo) {
    const control = createMovieTechnicalInfoControl(salesInfo)
    super(control)
  }
} 