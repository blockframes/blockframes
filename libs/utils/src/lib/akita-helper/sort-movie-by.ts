import { Movie } from '@blockframes/movie/+state';

export function sortMovieBy(a: Movie, b: Movie, sortIdentifier: string) {
  switch (sortIdentifier) {
    case 'Title':
      return a.title.international.localeCompare(b.title.international);
    case 'Director':
      return a.directors[0]?.lastName.localeCompare(b.directors[0]?.lastName);
    case 'Production Year':
      if (b.releaseYear < a.releaseYear) {
        return -1;
      }
      if (b.releaseYear > a.releaseYear) {
        return 1;
      }
      return 0;
    default:
      return 0;
  }
}
