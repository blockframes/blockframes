import DATA_THE_OWNERS from './theOwners';
import { FinancingMovie } from '../explorer/search/search.component';

export const CANNE_DATA = [DATA_THE_OWNERS];

export function getMovie(movieId: string): FinancingMovie {
  // TODO: use a well defined data type and throw explicitly when there is no instance.
  return CANNE_DATA.find(x => x.id === movieId) || null;
}
