/// <reference types="cypress" />
import { getTitle, Landing } from '../support/app.po';

describe('Hello Ip Upload', () => {
  beforeEach(() => cy.visit('/'));
  it('should display welcome message', () => {
    getTitle().contains('Welcome');
  });
});

let currentID = 0;

const randomID = (): string => (`${new Date().toISOString()}-${currentID++}`);

const createFakeScript = (title: string): any => cy.task('random:pdf', title);


describe('story #24: I am a user, I want to timestamp a document at the source of a new Intellectual Property', () => {
  it('', () => {
    let p: any = new Landing();
    p = p.clickConnection();
    p.fillEmail('laurent+test@singulargarden.com');
    p.fillPassword('helloworld');
    p = p.login();
    p = p.clickNewIp();
    p.fillTitle('This is my title');
    p.fillSynopsis('This is some synopsis for my IP');
    p.selectType('script');
    p.addGenre('horror');
    p.setVersion('0.1');

    createFakeScript(`My Script: ${randomID()}`)
      .then(path => p.uploadDocument(path))
      .then(() => p.hasUploadStatus('Success'))
      .then(() => p = p.save());

    // TODO: implement feedback check
  });
});

describe('Organization Management', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.viewport('macbook-15');
  });

  it.skip('story #43: As a User I want to be able to create an organisation and add members to it.', () => {
    let p: any = new Landing();
    p = p.clickConnection();
    p.fillEmail('laurent+test@singulargarden.com');
    p.fillPassword('helloworld');
    p = p.login();

    p = p.clickNewOrganization();
    p.fillName('Organization 42');
    p = p.save();
    const memberMail = `laurent+${randomID()}@cascade8.com`;

    p = p.addMember(memberMail);
    p.hasMember(memberMail);
  });
});
