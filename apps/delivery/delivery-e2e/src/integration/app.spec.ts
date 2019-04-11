/// <reference types="cypress" />
import { getTitle, LandingPage } from '../support/app.po';

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;
const materials = [
  {
    value: 'Paire de ProRes HQ 422 1080 24p 16/9 3D (Œil gauche/Œil droit)',
    description:
      'cadence à 24pfs, ratio image original (logo animé Bac Films en ouverture du film ; textes en Français, fonds neutres en fin de programme. Répartition des pistes audio : mix VF 5.1 en pistes 1 à 6 (L/R/C/SW/LS/RS) ‐ Mix VF LTRTenpistes 7&8–M&ELTRTenpistes9&10',
    category: 'FILM – Masters vidéo'
  },
  {
    value: 'Un (1) master ProRes HQ 422 1080 25p 16/9 2D ‐ varispeedé et harmonisé',
    description:
      'cadence à 25pfs, ratio image original (logo animé Bac Films en ouverture du film, textes en Français ; fonds neutres en fin de programme. Répartition des pistes audio : mix VF 5.1 en pistes 1 à 6 (L/R/C/SW/LS/RS) ‐ MixVFLTRTenpistes 7&8‐M&ELTRTenpistes9&10',
    category: 'FILM – Masters vidéo'
  },
  {
    value: 'D/M/E stems Version Anglaise 5.1+LTRT 24 i/s en continu',
    description:
      '(dialogues, musiques et effets non mixés et sur pistes séparées). En parfaite synchronisation avec le master vidéo 24 i/s du film. (Répartition des pistes audio : 1/left – 2/Center ‐ 3/right ‐ 4/Left surround ‐ 5/Right surround – 6/subwoofer ‐ 7/Extra ou additionnel)',
    category: 'FILM – Eléments son'
  }
];


beforeEach(() => {
  cy.clearCookies();
  cy.visit('http://localhost:4200/auth');
  cy.viewport('macbook-15');
});

describe('Hello Delivery', () => {
  it('should display SIGN IN / SIGN UP component', () => {
    getTitle().contains('Sign in');
  });
});

describe('I m a user and i can save a delivery as template', () => {
  it('', () => {
    let p: any = new LandingPage();
    p.fillEmail('delivery-test-e2e@cascade8.com');
    p.fillPassword('blockframes4tw');
    p = p.login();
    p.displayMovieMenu();
    p.clickOpenIn();
    p = p.selectApp();
    p = p.clickAddDelivery();
    p = p.clickCreateNewDelivery();
    p.clickAdd();
    for (let i = 0; i < materials.length; i++) {
      p.fillValue(materials[i].value);
      p.fillDescription(materials[i].description);
      p.fillCategory(materials[i].category);
      p.clickAddMaterial();
    }
  });
});

// describe('i m a user and i can create an empty template', () => {
//   it('', () => {
//     let p: any = new LandingPage();
//     p.fillEmail('delivery-test-e2e@cascade8.com');
//     p.fillPassword('blockframes4tw');
//     p = p.login();
//     p.displayUserMenu();
//     p.selectOrganization('Org1');
//     cy.visit('/');
//     p = p.selectTemplate();
//     p = p.createTemplate();
//     const templateName= randomID();
//     p.fillTemplateName(templateName);
//     p = p.clickCreate();
//     p.assertTemplateExists(templateName);
//     //p.clickMenu(templateName);
//   })
// })
