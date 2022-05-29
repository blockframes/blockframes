import { get, firestore, maintenance } from '@blockframes/testing/cypress/browser';

interface META {
  startedAt: Date | null;
  endedAt: Date | null;
}

describe('Maintenance mode tests', () => {
  it('start / end', () => {
    cy.visit('');
    //starting maintenance mode
    maintenance.start();
    firestore.get(['_META/_MAINTENANCE']).then((data: META[]) => {
      const [meta] = data;
      expect(meta.startedAt).not.to.be.null;
      expect(meta.endedAt).to.be.null;
    });
    get('maintenance-mode').should('exist');

    //ending maintenance mode
    maintenance.end();
    firestore.get(['_META/_MAINTENANCE']).then((data: META[]) => {
      const [meta] = data;
      expect(meta.startedAt).to.be.null;
      expect(meta.endedAt).not.to.be.null;
    });
    get('maintenance-refresh').should('exist').click();
    get('maintenance-mode').should('not.exist');
  });
});
