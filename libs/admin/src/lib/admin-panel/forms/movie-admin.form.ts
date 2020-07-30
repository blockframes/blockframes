import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Movie, createMovie } from '@blockframes/movie/+state/movie.model';
import { app } from '@blockframes/utils/apps';

function createMovieAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    storeStatus: new FormControl(movie.storeConfig.status),
    storeType: new FormControl(movie.storeConfig.storeType),
    productionStatus: new FormControl(movie.productionStatus),
    internalRef: new FormControl(movie.internalRef),
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
  const appAccess = {} as any;
  for (const a of app) {
    appAccess[a] = new FormControl(movie.storeConfig.appAccess[a])
  }
  return appAccess;
}

type MovieAppAccessAdminControl = ReturnType<typeof createAppAccessMovieControls>;

export class MovieAppAccessAdminForm extends FormEntity<MovieAppAccessAdminControl> {
  constructor(data?: Movie) {
    super(createAppAccessMovieControls(data));
  }
}
