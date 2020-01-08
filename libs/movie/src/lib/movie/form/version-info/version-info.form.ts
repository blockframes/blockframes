import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createMovieVersionInfoControls(versionInfo?: Partial<MovieVersionInfo>){
  const { subtitles, dubbings } = createMovieVersionInfo(versionInfo);
  return {
    subtitles: new FormControl(subtitles),
    dubbings: new FormControl(dubbings),
  }
}

type MovieVersionInfoControl = ReturnType<typeof createMovieVersionInfoControls>

export class MovieVersionInfoForm extends FormEntity<MovieVersionInfoControl>{
  constructor(versionInfo?: MovieVersionInfo) {
    super(createMovieVersionInfoControls(versionInfo));
  }
}
