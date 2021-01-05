import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Movie, createMovie } from '@blockframes/movie/+state/movie.model';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
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

/** Admin form for poster, banner and pictures of the movie */
function createMovieImageAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    poster: new HostedMediaForm(movie.poster),
    banner: new HostedMediaForm(movie.banner),
    still_photos: FormList.factory(movie.promotional.still_photo, el => new HostedMediaForm(el)),
  }
}

type MoviePictureAdminControl = ReturnType<typeof createMovieImageAdminControls>;

export class MoviePictureAdminForm extends FormEntity<MoviePictureAdminControl> {
  constructor(movie?: Movie) {
    super(createMovieImageAdminControls(movie));
  }
}
