import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createMovieVersionInfoControls(versionInfo?: Partial<MovieVersionInfo>){
  const entity = createMovieVersionInfo(versionInfo);
  return {
    subtitles: new FormField(entity.subtitles),
    dubbings: new FormField(entity.dubbings),
  }
}

type MovieVersionInfoControl = ReturnType<typeof createMovieVersionInfoControls>

export class MovieVersionInfoForm extends FormEntity<MovieVersionInfoControl>{
  constructor(versionInfo?: MovieVersionInfo) {
    super(createMovieVersionInfoControls(versionInfo));
  }

}
