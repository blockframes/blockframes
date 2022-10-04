import { ProductionStatus } from '@blockframes/model';
import { get } from '@blockframes/testing/cypress/browser';

export function checkMovieTunnelSideNav(status: ProductionStatus) {
  get('steps-list')
    .should('contain', 'First Step')
    .and('contain', 'Title Information')
    .and('contain', 'Main Information')
    .and('contain', 'Storyline Elements')
    .and('contain', 'Production Information')
    .and('contain', 'Artistic Team')
    .and('contain', 'Additional Information')
    .and('contain', 'Technical Specification')
    .and('contain', 'Promotional Elements')
    .and('contain', 'Files')
    .and('contain', 'Images')
    .and('contain', 'Videos')
    .and('contain', 'Screener')
    .and('contain', 'Last Step');
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
