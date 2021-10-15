
import { Movie } from '@blockframes/movie/+state';

import {
  formatSingleValue,
} from './format';

describe('Test spreadsheet formats functions', () => {

  it('formatSingleValue', () => {

    const movie = { app: { catalog: { status: 'draft' } } };

    formatSingleValue('submitted', 'storeStatus', 'app.catalog.status', movie as Movie);

    expect(movie).toEqual({ app: { catalog: { status: 'submitted' } } });
  });

});
