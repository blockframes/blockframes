import DATA_ANETTE from './annette';

export const CANNE_DATA = [DATA_ANETTE];

export function getMovie(movieId: string): any {
  return CANNE_DATA.find(x => x.id === movieId) || null;
}
