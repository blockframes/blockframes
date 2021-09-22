/// <reference types="cypress" />

import { HomePage } from "../../support/pages/marketplace";
import { LandingPage } from '../../support/pages/landing';
import { TunnelContractLobbyPage, TunnelContractPage, TunnelContractSummaryPage } from "../../support/pages/dashboard";
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Jean) ];

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
  cy.visit('/');
  const p1 = new LandingPage();
  p1.clickSignup();
});

describe('User can fill and save contract tunnel form', () => {
  //TODO: Issue 3787
  // Current implementation is not ok and might change
  // The tests will be updated when changes are properly implented
  it.skip('Login into an existing account, navigate on titles list page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
    // Connexion
    const p2: AuthLoginPage = new AuthLoginPage();
    p2.fillSignin(users[0]);
    p2.clickSignIn();
    //const p3 = new HomePage();

    // Navigate to tunnel-contract
    const p4: TunnelContractLobbyPage = TunnelContractLobbyPage.navigateToPage();
    const p5: TunnelContractPage = p4.clickSale();

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
    // p5.fillPercentagePaymentUponEvent(PERCENTAGE);
    // p5.assertPercentagePaymentUponEventExists(PERCENTAGE);
    // p5.selectTriggeringEvent(TRIGGERING_EVENT);
    // p5.assertTriggeringEventIsSelected(TRIGGERING_EVENT);

    p5.fillPaymentTermDuration(DURATION);
    p5.assertPaymentTermDurationExists(DURATION);
    p5.selectPaymentDurationPeriod(PERIOD);
    p5.assertPaymentDurationPeriodIsSelected(PERIOD);
    // p5.selectPaymentTermEvent(TRIGGERING_EVENT);
    // p5.assertPaymentTermEventIsSelected(TRIGGERING_EVENT);

    /* Save, reload and verify the fields
    p5.clickSave(); */
    cy.reload();
    cy.wait(5000);


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

    // Terms For 90 months starting from ContractSignatureDate.
    p6.assertTermsExist(EVENT_SUMMARY, DURATION, PERIOD_SUMMARY);
    // Title Selection & Price
    p6.assertCurrencyExists(CURRENCY_SUMMARY);
    p6.assertPackagePriceExists(PACKAGE_PRICE_SUMMARY);
  });
});
