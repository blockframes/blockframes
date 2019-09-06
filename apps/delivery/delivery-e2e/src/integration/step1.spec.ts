// /// <reference types="cypress" />

// import { LandingPage, HomePage, MovieTeamWorkPage, TemplatePickerPage, DeliverySettingsFormPage, DeliveryListPage, DeliveryTeamWorkPage, DeliveryFormPage } from "../support/pages";

// const EMAIL_USER1 = 'hello@thejokers.com';
// const PASSWORD_USER1 = 'blockframes';
// const MOVIE_STEP1 = 'PARASITE';
// const TEMPLATE_USER1 = 'JOKERS DELIVERY SCHEDULE';
// const ORG_USER1 = 'The jokers';

// const EMAIL_USER2 = 'cjentertainment@blockframes.com';
// const PASSWORD_USER2 = 'blockframes';
// const ORG_USER2 = 'CJ Entertainment';

// const VALUE_MAT1 = 'WAV (24 fps and 25 fps) Stems 5.1 & 7.1';
// const VALUE_MAT2 = 'DCP w/ English subtitles mix OV 5.1 + 7.1 & DKDM';
// const STEP_NAME1 = 'Marketing';
// const STEP_DATE1 = '26';
// const GENERAL_DATE1 = '30';

// beforeEach(() => {
//   cy.clearCookies();
//   cy.clearLocalStorage();
//   cy.visit('/auth');
//   cy.viewport('macbook-15');
// });

// describe('Step 1: I\'m a user, I want accept a notification that add my org in a movie, create a delivery with a template, add a stakeholder, and sign', () => {
//   it.skip('should create delivery with a template, add step, add step to materials and sign delivery', () => {
//     // TODO: reset database

//     // Connexion
//     const p1: LandingPage = new LandingPage();
//     p1.fillSigninEmail(EMAIL_USER1);
//     p1.fillSigninPassword(PASSWORD_USER1);
//     const p2: HomePage = p1.login();

//     // Accept the notification for a movie
//     p2.openNotifications();
//     const p3: MovieTeamWorkPage = p2.clickAcceptInvitationToMovie();
//     const p4: HomePage = p3.clickHome();

//     // Go to app-delivery
//     const p5: DeliveryListPage = p4.clickOnMovie(MOVIE_STEP1);

//     // Open template picker
//     const p6: TemplatePickerPage = p5.clickAddDelivery();

//     // Select a template
//     const p7: DeliverySettingsFormPage = p6.clickTemplateDelivery(TEMPLATE_USER1);

//     // Add general date and step to delivery
//     p7.pickGeneralDate(GENERAL_DATE1);
//     p7.clickCreateStep();
//     p7.fillStepName(STEP_NAME1);
//     p7.pickStepDate(STEP_DATE1);
//     p7.clickSaveStep();

//     // Go to team-work page
//     const p8: DeliveryTeamWorkPage = p7.clickTeamWork();
//     p8.clickAddStakeholder(ORG_USER2);
//     const p9: DeliveryFormPage = p8.clickDelivery();

//     // Add step to materials
//     p9.clickCheckBoxMaterials(
//       [VALUE_MAT1, VALUE_MAT2]
//     );
//     p9.scrollToAction();
//     p9.clickButtonAction();
//     p9.clickChangeStep();
//     p9.clickAddStep(STEP_NAME1);
//     //TODO: verify if materials have the step
//     p9.openLogout();
//     const p10 = p9.clickLogout();

//     // Sign in with cjentertainment@blockframes.com
//     p10.fillSigninEmail(EMAIL_USER2);
//     p10.fillSigninPassword(PASSWORD_USER2);
//     const p11 = p10.login();

//     // Accept invitation to delivery, delete one material and sign delivery
//     p11.openNotifications();
//     const p12: DeliveryTeamWorkPage = p11.clickAcceptInvitationToDelivery();
//     const p13: DeliveryFormPage = p12.clickDelivery();
//     p13.clickDeleteMaterial(VALUE_MAT1);
//     p13.verifyDeletedMaterial(VALUE_MAT1);
//     p13.clickAddSignature();
//     p13.clickVerifyToSign();
//     p13.fillPassword(PASSWORD_USER2);
//     p13.clickSign();
//     p13.openLogout();
//     const p14: LandingPage = p13.clickLogout();

//     // Login with demo@blockframes.com and sign the delivery
//     p14.fillSigninEmail(EMAIL_USER1);
//     p14.fillSigninPassword(PASSWORD_USER1);
//     const p15: HomePage = p14.login();
//     const p16: DeliveryListPage = p15.clickOnMovie(MOVIE_STEP1)
//     const p17: DeliveryFormPage = p16.clickDelivery(ORG_USER1, ORG_USER2);
//     p17.clickAddSignature();
//     p17.clickVerifyToSign();
//     p17.fillPassword(PASSWORD_USER1);
//     p17.clickSign();

//     // Verify if we have 2 signatures
//     p17.verifySignatures(2);
//   })
// });
