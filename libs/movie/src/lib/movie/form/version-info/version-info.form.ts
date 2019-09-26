import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils/form';

function createMovieVersionInfoControls(versionInfo: Partial<MovieVersionInfo> = {}){
  const entity = createMovieVersionInfo(versionInfo);
  return {
    subtitles: new FormField(entity.subtitles),
    dubbings: new FormField(entity.dubbings),
  }
}

type MovieVersionInfoControl = ReturnType<typeof createMovieVersionInfoControls>

export class MovieVersionInfoForm extends FormEntity<Partial<MovieVersionInfo>, MovieVersionInfoControl>{
  constructor(VersionInfo : MovieVersionInfo) {
    super(createMovieVersionInfoControls(VersionInfo));
  }

}
