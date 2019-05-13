import DATA_ANETTE from './annette';

export const CANNE_DATA = [DATA_ANETTE];

export function getMovie(movieId: string): any {
  // TODO: use a well defined data type and throw explicitly when there is no instance.
  return CANNE_DATA.find(x => x.id === movieId) || null;
}
