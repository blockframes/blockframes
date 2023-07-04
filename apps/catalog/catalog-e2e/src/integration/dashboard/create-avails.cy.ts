import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  findIn,
  assertUrlIncludes,
  snackbarShould,
  escapeKey,
  assertMultipleTexts,
} from '@blockframes/testing/cypress/browser';
import {
  user,
  org,
  orgPermissions,
  moviePermissions,
  acceptedMovie as movie,
  expectedContract,
  expectedTerm,
} from '../../fixtures/dashboard/create-avails';
import { Contract, Term } from '@blockframes/model';

const today = new Date();
const nextYear = today.getFullYear() + 1;

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Create avails', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.deleteContractsAndTerms(org.id);
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
  });

  it('Add new avails for a movie', () => {
    get('avails').click();
    get('add').click();
    get('title-select').click();
    assertMultipleTexts(`title_${movie.id}`, [movie.title.international, '(Accepted)']).click();
    get('next').click();
    assertUrlIncludes(`c/o/dashboard/avails/select/${movie.id}/manage`);
    get('territories').click();
    get('Europe').click();
    get('Latin America').click();
    get('nepal').click();
    escapeKey();
    assertMultipleTexts('territories', ['Europe', 'Latin America', 'Nepal']);
    get('medias').click();
    get('TV').click();
    get('Festivals').click();
    get('rental').click();
    escapeKey();
    assertMultipleTexts('medias', ['TV', 'Festivals', 'Rental']);
    get('dateFrom').clear().type(`01/01/${nextYear}`);
    get('dateTo').clear().type(`12/12/${nextYear}`);
    get('exclusivity').click();
    get('non-exclusive').click();
    get('add-version').click();
    get('languages').find('input').type('fr');
    get('option_french').click();
    get('save-language').click();
    findIn('french', 'subtitle').click();
    get('add-version').click();
    get('languages').find('input').click();
    get('option_english').click();
    get('save-language').click();
    findIn('english', 'dubbed').click();
    get('table-save').click();
    get('save').click();
    snackbarShould('contain', '1 Term(s) created.');
    firestore
      .queryData({ collection: 'contracts', field: 'titleId', operator: '==', value: movie.id })
      .then((contracts: Contract[]) => {
        //check contract in database
        expect(contracts).to.have.lengthOf(1);
        const contract = contracts[0];
        const buyerId = contract.buyerId;
        expect(contract).to.deep.include({ ...expectedContract, buyerId, stakeholders: [buyerId, org.id] });
        //check term in database
        expect(contract.termIds).to.have.lengthOf(1);
        const termId = contract.termIds[0];
        firestore
          .get(`terms/${termId}`)
          .then((term: Term) => expect(term).to.deep.include({ ...expectedTerm, contractId: contract.id }));
      });
  });
});
