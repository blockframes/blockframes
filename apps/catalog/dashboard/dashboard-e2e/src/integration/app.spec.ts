import { setupForMacbook } from '@blockframes/e2e';
import { getH1 } from '../support';

beforeEach(() => {
  setupForMacbook();
});

describe('catalog-dashboard', () => {
  it.skip('should display welcome message', () => {
    getH1().contains('Welcome to catalog-dashboard!');
  });
});
