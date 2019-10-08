import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createMovieVersionInfoControls(versionInfo?: Partial<MovieVersionInfo>){
  const { subtitles, dubbings } = createMovieVersionInfo(versionInfo);
  return {
    subtitles: new FormField(subtitles),
    dubbings: new FormField(dubbings),
  }
}

type MovieVersionInfoControl = ReturnType<typeof createMovieVersionInfoControls>

export class MovieVersionInfoForm extends FormEntity<MovieVersionInfoControl>{
  constructor(versionInfo?: MovieVersionInfo) {
    super(createMovieVersionInfoControls(versionInfo));
  }
}
