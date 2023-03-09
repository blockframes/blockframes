import { ProductionStatus } from '@blockframes/model';
import { assertMultipleTexts, get } from '@blockframes/testing/cypress/browser';

export function checkMovieTunnelSideNav(status: ProductionStatus) {
  assertMultipleTexts('steps-list', [
    'First Step',
    'Title Information',
    'Main Information',
    'Storyline Elements',
    'Production Information',
    'Artistic Team',
    'Additional Information',
    'Technical Specification',
    'Promotional Elements',
    'Files',
    'Images',
    'Videos',
    'Screener',
    'Last Step',
  ]);
  if (status !== 'development') {
    get('steps-list').should('contain', 'Versions');
  } else {
    get('steps-list').should('not.contain', 'Versions');
  }
  if (status !== 'development' && status !== 'shooting') {
    get('steps-list').should('contain', 'Selections & Reviews');
  } else {
    get('steps-list').should('not.contain', 'Selections & Reviews');
  }
  if (status !== 'post_production' && status !== 'finished' && status !== 'released') {
    get('steps-list').should('contain', 'Notes & Statements');
  } else {
    get('steps-list').should('not.contain', 'Notes & Statements');
  }
  if (status !== 'released') {
    get('steps-list').should('contain', 'Shooting Information');
  } else {
    get('steps-list').should('not.contain', 'Shooting Information');
  }
}
