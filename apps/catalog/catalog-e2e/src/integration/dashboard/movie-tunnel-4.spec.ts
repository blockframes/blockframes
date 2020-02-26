/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelCreditsPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

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

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const MOVIE_ID = 'J5d6CcA8u3PoQhs71eiX'; // Aznavour by Charles

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6', () => {
  it.skip('Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-4 and fill the fields
    const p4: TunnelCreditsPage = TunnelCreditsPage.navigateToPage(MOVIE_ID);

    // Production year
    p4.fillProductionYear(PRODUCTION_YEAR);
    p4.assertProductionYearExists(PRODUCTION_YEAR);

    // Production company
    p4.fillFirstProductioncompany(PRODUCTION, STAKEHOLDERS[0]);
    p4.assertFirstProductioncompanyExists(PRODUCTION, STAKEHOLDERS[0]);
    p4.fillFirstCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[0]);
    p4.selectCountryProductioncompany(COUNTRIES[0]);
    p4.assertFirstCountryProductioncompanyExists(PRODUCTION, COUNTRIES[0]);
    p4.clickAddProductioncompany(PRODUCTION, );
    p4.fillLastProductioncompany(PRODUCTION, STAKEHOLDERS[1]);
    p4.assertLastProductioncompanyExists(PRODUCTION, STAKEHOLDERS[1]);
    p4.fillLastCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[1]);
    p4.selectCountryProductioncompany(COUNTRIES[1]);
    p4.assertLastCountryProductioncompanyExists(PRODUCTION, COUNTRIES[1]);

    // Co-production company
    p4.fillFirstProductioncompany(CO_PRODUCTION, STAKEHOLDERS[2]);
    p4.assertFirstProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[2]);
    p4.fillFirstCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[2]);
    p4.selectCountryProductioncompany(COUNTRIES[2]);
    p4.assertFirstCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[2]);
    p4.clickAddProductioncompany(CO_PRODUCTION, );
    p4.fillLastProductioncompany(CO_PRODUCTION, STAKEHOLDERS[3]);
    p4.assertLastProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[3]);
    p4.fillLastCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[3]);
    p4.selectCountryProductioncompany(COUNTRIES[3]);
    p4.assertLastCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[3]);

    // Producer
    p4.fillFirstSalesCastFirstName(PRODUCER, PRODUCERS[0]);
    p4.assertFirstSalesCastFirstNameExists(PRODUCER, PRODUCERS[0]);
    p4.fillFirstSalesCastLastName(PRODUCER, PRODUCERS[1]);
    p4.assertFirstSalesCastLastNameExists(PRODUCER, PRODUCERS[1]);
    p4.clickSelectFirstSalesCastRole(PRODUCER);
    p4.selectSalesCastRole(ROLES[0]);
    p4.assertFirstSalesCastRoleExists(PRODUCER, ROLES[0]);

    // Crew member
    p4.fillFirstSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[0]);
    p4.assertFirstSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[0]);
    p4.fillFirstSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[1]);
    p4.assertFirstSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[1]);
    p4.clickSelectFirstSalesCastRole(CREW_MEMBER);
    p4.selectSalesCastRole(ROLES[1]);
    p4.assertFirstSalesCastRoleExists(CREW_MEMBER, ROLES[1]);
    p4.clickAddSalesCast(CREW_MEMBER);
    p4.fillLastSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[2]);
    p4.assertLastSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[2]);
    p4.fillLastSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[3]);
    p4.assertLastSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[3]);
    p4.clickSelectLastSalesCastRole(CREW_MEMBER);
    p4.selectSalesCastRole(ROLES[2]);
    p4.assertLastSalesCastRoleExists(CREW_MEMBER, ROLES[2]);

    // Go on movie-tunnel-5
    const p5: TunnelBudgetPage = p4.clickNext();
  });
});
