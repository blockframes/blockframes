import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Movie, createMovie } from '@blockframes/movie/+state/movie.model';


function createMovieAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    storeStatus: new FormControl(movie.main.storeConfig.status),
    storeType: new FormControl(movie.main.storeConfig.storeType),
    productionStatus: new FormControl(movie.main.status),
    internalRef: new FormControl(movie.main.internalRef),
  };
}

type MovieAdminControl = ReturnType<typeof createMovieAdminControls>;

export class MovieAdminForm extends FormEntity<MovieAdminControl> {
  constructor(data?: Movie) {
    super(createMovieAdminControls(data));
  }
}

// STORE CONFIG APP ACCESS
function createAppAccessMovieControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    catalog: new FormControl(movie.main.storeConfig.appAccess.catalog),
    festival: new FormControl(movie.main.storeConfig.appAccess.festival),
  };
}

type MovieAppAccessAdminControl = ReturnType<typeof createAppAccessMovieControls>;

export class MovieAppAccessAdminForm extends FormEntity<MovieAppAccessAdminControl> {
  constructor(data?: Movie) {
    super(createAppAccessMovieControls(data));
  }
}
