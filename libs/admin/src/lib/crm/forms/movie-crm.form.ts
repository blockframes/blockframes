import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Movie, createMovie } from '@blockframes/movie/+state/movie.model';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';

function createMovieCrmControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    productionStatus: new FormControl(movie.productionStatus),
    internalRef: new FormControl(movie.internalRef),
    orgIds: FormList.factory(movie.orgIds, el => new FormControl(el))
  };
}

type MovieCrmControl = ReturnType<typeof createMovieCrmControls>;

export class MovieCrmForm extends FormEntity<MovieCrmControl> {
  constructor(data?: Movie) {
    super(createMovieCrmControls(data));
  }
}


/** CRM form for poster, banner and pictures of the movie */
function createMovieImageCrmControls(entity: Partial<Movie>) {
  const movie = createMovie(entity);
  return {
    poster: new StorageFileForm(movie.poster),
    banner: new StorageFileForm(movie.banner),
    still_photo: FormList.factory(movie.promotional.still_photo, el => new StorageFileForm(el)),
  }
}

type MoviePictureCrmControl = ReturnType<typeof createMovieImageCrmControls>;

export class MoviePictureCrmForm extends FormEntity<MoviePictureCrmControl> {
  constructor(movie?: Movie) {
    super(createMovieImageCrmControls(movie));
  }

  get poster() { return this.get('poster'); }

  get banner() { return this.get('banner'); }

  get stillPhoto() { return this.get('still_photo'); }

  test(){
    const arr = [
      { name: 'jeremie', lastName: 'seguillon'}, { name: 'jean', lastName: 'ragnoti'}
    ]
    
    const applyFilters = (invitations, filters) => {
      const inv = filters.name?.length ? invitations.filter(inv => filters.name.includes(inv.name)) : invitations;
      return filters.lastName?.length ? inv.filter(inv => filters.lastName.includes(inv.lastName)) : inv;
    };
    
    const arrByName = applyFilters(arr, { name:['jean', 'seguillon', 'test']})
    console.log(arrByName)
    
  }
}
