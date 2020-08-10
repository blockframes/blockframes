import { Movie } from '@blockframes/movie/+state/movie.model';

export function sortMovieBy(a: Movie, b: Movie, sortIdentifier: string) {
  switch (sortIdentifier) {
    case 'Title':
      return a.title.international.localeCompare(b.title.international);
    case 'Director':
      return a.directors[0]?.lastName.localeCompare(b.directors[0]?.lastName);
    case 'Production Year':
      if (b.release.year < a.release.year) {
        return -1;
      }
      if (b.release.year > a.release.year) {
        return 1;
      }
      return 0;
    default:
      return 0;
  }
}
