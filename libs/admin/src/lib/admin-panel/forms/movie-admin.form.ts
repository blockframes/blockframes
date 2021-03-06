import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Movie, createMovie } from '@blockframes/movie/+state/movie.model';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';

function createMovieAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
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


/** Admin form for poster, banner and pictures of the movie */
function createMovieImageAdminControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    poster: new StorageFileForm(movie.poster),
    banner: new StorageFileForm(movie.banner),
    still_photo: FormList.factory(movie.promotional.still_photo, el => new StorageFileForm(el)),
  }
}

type MoviePictureAdminControl = ReturnType<typeof createMovieImageAdminControls>;

export class MoviePictureAdminForm extends FormEntity<MoviePictureAdminControl> {
  constructor(movie?: Movie) {
    super(createMovieImageAdminControls(movie));
  }

  get poster() { return this.get('poster'); }

  get banner() { return this.get('banner'); }

  get stillPhoto() { return this.get('still_photo'); }
}
