import { createMovieSalesInfo, MovieSalesInfo } from '../../+state/movie.model'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormControl } from '@angular/forms';

function createTheatricalReleaseInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    originCountryReleaseDate: new FormControl(entity.originCountryReleaseDate),
    theatricalRelease: new FormControl(entity.theatricalRelease),
  }
}

type TheatricalReleaseFormControl = ReturnType<typeof createTheatricalReleaseInfoControls>;

export class MovieFormTheatricalReleaseModule extends FormEntity<TheatricalReleaseFormControl> {
  constructor(release?: MovieSalesInfo) {
    super(createTheatricalReleaseInfoControls(release));
  }
}
