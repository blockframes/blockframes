/// <reference types="cypress" />

import { clearDataAndPrepareTest } from "../../support/utils/utils";
import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";
import { HomePage } from "../../support/pages/marketplace";
import { TunnelContractLobbyPage, TunnelContractPage, TunnelContractSummaryPage } from "../../support/pages/dashboard";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const PARTIAL_PARTY_NAMES = ['m', 'ma'];
const PARTY_NAMES = ['main', 'main'];
const ROLES = ['Licensor', 'Licensee'];
const EVENT = 'Contract Signature Date';
const EVENT_SUMMARY = 'ContractSignatureDate';
const DURATION = '90';
const PERIOD = 'Months';
const PERIOD_SUMMARY = 'months';
const CURRENCY = 'Euro';
const CURRENCY_SUMMARY = 'EUR';
const PACKAGE_PRICE = '1000000';
const PACKAGE_PRICE_SUMMARY = '€1,000,000.00';
const PERCENTAGE = '60';
const TRIGGERING_EVENT = 'First theatrical release';

beforeEach(() => {
  clearDataAndPrepareTest();
});

describe('User can navigate to the movie tunnel page 1 and 2', () => {
  it('Login into an existing account, navigate on titles list page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to tunnel-contract
    const p4: TunnelContractLobbyPage = TunnelContractLobbyPage.navigateToPage();
    const p5: TunnelContractPage = p4.clickSale();

    // Party Name
    p5.fillFirstPartyName(PARTIAL_PARTY_NAMES[0]);
    p5.selectFirstPartyName(PARTY_NAMES[0]);
    p5.assertFirstPartyNameExists(PARTY_NAMES[0]);
    p5.selectFirstRole(ROLES[0]);
    p5.assertFirstRoleIsSelected(ROLES[0]);

    p5.fillLastPartyName(PARTIAL_PARTY_NAMES[1]);
    p5.selectLastPartyName(PARTY_NAMES[1]);
    p5.assertLastPartyNameExists(PARTY_NAMES[1]);
    p5.selectLastRole(ROLES[1]);
    p5.assertLastRoleIsSelected(ROLES[1]);

    // Terms
    p5.selectEvent(EVENT);
    p5.assertEventIsSelected(EVENT);
    p5.fillDuration(DURATION);
    p5.assertDurationExists(DURATION);
    p5.selectPeriod(PERIOD);
    p5.assertPeriodIsSelected(PERIOD);

    // Title Selection & Price
    p5.selectCurrency(CURRENCY);
    p5.assertCurrencyIsSelected(CURRENCY);
    // TODO: search selection
    p5.fillPackagePrice(PACKAGE_PRICE);
    p5.assertPackagePriceExists(PACKAGE_PRICE);

    // Payment Schedules
    p5.selectPaymentsUponEvent();
    p5.fillPercentagePaymentUponEvent(PERCENTAGE);
    p5.assertPercentagePaymentUponEventExists(PERCENTAGE);
    p5.selectTriggeringEvent(TRIGGERING_EVENT);
    p5.assertTriggeringEventIsSelected(TRIGGERING_EVENT);

    p5.fillPaymentTermDuration(DURATION);
    p5.assertPaymentTermDurationExists(DURATION);
    p5.selectPaymentDurationPeriod(PERIOD);
    p5.assertPaymentDurationPeriodIsSelected(PERIOD);
    p5.selectPaymentTermEvent(TRIGGERING_EVENT);
    p5.assertPaymentTermEventIsSelected(TRIGGERING_EVENT);

    // Save, reload and verify the fields
    p5.clickSave();
    cy.reload();
    p5.assertFirstPartyNameExists(PARTY_NAMES[0]);
    p5.assertFirstRoleIsSelected(ROLES[0]);
    p5.assertLastPartyNameExists(PARTY_NAMES[1]);
    p5.assertLastRoleIsSelected(ROLES[1]);
    p5.assertEventIsSelected(EVENT);
    p5.assertDurationExists(DURATION);
    p5.assertPeriodIsSelected(PERIOD);
    p5.assertCurrencyIsSelected(CURRENCY);
    p5.assertPackagePriceExists(PACKAGE_PRICE);
    // TODO: percentage payment, triggering event
    p5.assertPaymentTermDurationExists(DURATION);
    p5.assertPaymentDurationPeriodIsSelected(PERIOD);
    p5.assertPaymentTermEventIsSelected(TRIGGERING_EVENT);

    // Go to Contract Summary Page and check that the summary page has the information
    const p6: TunnelContractSummaryPage = p5.clickNext();

    // Party Name
    p6.assertFirstPartyNameExists(PARTY_NAMES[0]);
    p6.assertFirstPartyNameExists(PARTY_NAMES[1]);
    // Terms For 90 months starting from ContractSignatureDate.
    p6.assertTermsExist(EVENT_SUMMARY, DURATION, PERIOD_SUMMARY);
    // Title Selection & Price
    p6.assertCurrencyExists(CURRENCY_SUMMARY);
    p6.assertPackagePriceExists(PACKAGE_PRICE_SUMMARY);
  });
});
