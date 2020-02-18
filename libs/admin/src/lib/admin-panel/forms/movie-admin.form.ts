import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { Movie, createMovie } from '@blockframes/movie';


function createMovieAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    storeStatus: new FormControl(movie.main.storeConfig.status),
    storeType: new FormControl(movie.main.storeConfig.storeType),
  };
}

type MovieAdminControl = ReturnType<typeof createMovieAdminControls>;

export class MovieAdminForm extends FormEntity<MovieAdminControl> {
  constructor(data?: Movie) {
    super(createMovieAdminControls(data));
  }
}
