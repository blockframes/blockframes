/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelCreditsPage, TunnelMainPage } from '../../support/pages/dashboard';
import { signInAndNavigateToMain } from '../../support/utils/utils';

// TEST

const NAVIGATION = ['Title Information', 'Credits'];

const PRODUCTION_YEAR = '2006';
const STAKEHOLDERS = ['Realitism Films', 'Backup Media', 'Parabola Films', 'Beauvoir Films'];
const COUNTRIES = ['France', 'Germany', 'Canada', 'China'];
const PARTIAL_COUNTRIES = ['Fra', 'Ger', 'can', 'chin'];
const PRODUCTION = 'production';
const CO_PRODUCTION = 'co-production';
const PRODUCERS = ['Grégory', 'Bernard'];
const PRODUCER = 'producer';
const CREW_MEMBERS = ['Laure', 'Mercier', 'Sindika', 'Dokolo'];
const CREW_MEMBER = 'crew-member';
const ROLES = ['Executive Producer', 'Line Producer', 'Associate Producer'];

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6', () => {
  it('Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelCreditsPage();

    // Production year
    p2.fillProductionYear(PRODUCTION_YEAR);
    p2.assertProductionYearExists(PRODUCTION_YEAR);

    // Production company
    p2.fillFirstProductioncompany(PRODUCTION, STAKEHOLDERS[0]);
    p2.assertFirstProductioncompanyExists(PRODUCTION, STAKEHOLDERS[0]);
    p2.fillFirstCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[0]);
    p2.selectCountryProductioncompany(COUNTRIES[0]);
    p2.assertFirstCountryProductioncompanyExists(PRODUCTION, COUNTRIES[0]);
    p2.clickAddProductioncompany(PRODUCTION, );
    p2.fillLastProductioncompany(PRODUCTION, STAKEHOLDERS[1]);
    p2.assertLastProductioncompanyExists(PRODUCTION, STAKEHOLDERS[1]);
    p2.fillLastCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[1]);
    p2.selectCountryProductioncompany(COUNTRIES[1]);
    p2.assertLastCountryProductioncompanyExists(PRODUCTION, COUNTRIES[1]);

    // Co-production company
    p2.fillFirstProductioncompany(CO_PRODUCTION, STAKEHOLDERS[2]);
    p2.assertFirstProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[2]);
    p2.fillFirstCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[2]);
    p2.selectCountryProductioncompany(COUNTRIES[2]);
    p2.assertFirstCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[2]);
    p2.clickAddProductioncompany(CO_PRODUCTION, );
    p2.fillLastProductioncompany(CO_PRODUCTION, STAKEHOLDERS[3]);
    p2.assertLastProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[3]);
    p2.fillLastCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[3]);
    p2.selectCountryProductioncompany(COUNTRIES[3]);
    p2.assertLastCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[3]);

    // Producer
    p2.fillFirstSalesCastFirstName(PRODUCER, PRODUCERS[0]);
    p2.assertFirstSalesCastFirstNameExists(PRODUCER, PRODUCERS[0]);
    p2.fillFirstSalesCastLastName(PRODUCER, PRODUCERS[1]);
    p2.assertFirstSalesCastLastNameExists(PRODUCER, PRODUCERS[1]);
    p2.clickSelectFirstSalesCastRole(PRODUCER);
    p2.selectSalesCastRole(ROLES[0]);
    p2.assertFirstSalesCastRoleExists(PRODUCER, ROLES[0]);

    // Crew member
    p2.fillFirstSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[0]);
    p2.assertFirstSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[0]);
    p2.fillFirstSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[1]);
    p2.assertFirstSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[1]);
    p2.clickSelectFirstSalesCastRole(CREW_MEMBER);
    p2.selectSalesCastRole(ROLES[1]);
    p2.assertFirstSalesCastRoleExists(CREW_MEMBER, ROLES[1]);
    p2.clickAddSalesCast(CREW_MEMBER);
    p2.fillLastSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[2]);
    p2.assertLastSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[2]);
    p2.fillLastSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[3]);
    p2.assertLastSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[3]);
    p2.clickSelectLastSalesCastRole(CREW_MEMBER);
    p2.selectSalesCastRole(ROLES[2]);
    p2.assertLastSalesCastRoleExists(CREW_MEMBER, ROLES[2]);

    // Go on movie-tunnel-5
    const p3: TunnelBudgetPage = p2.clickNext();
  });
});
