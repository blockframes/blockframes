/// <reference types="cypress" />

// Pages
import {
  FestivalMarketplaceHomePage,
  FestivalOrganizationListPage,
  FestivalMarketplaceOrganizationTitlePage,
  FestivalScreeningPage,
  FestivalMarketplaceNotificationsPage,
  FestivalMarketplaceCalendarPage,
  FestivalMarketplaceEventPage
} from '../../support/pages/marketplace/index';
import {
  FestivalDashboardHomePage,
  FestivalInvitationsPage,
  EventPage,
  EventEditPage
} from '../../support/pages/dashboard/index';
import { LandingPage } from '../../support/pages/landing';
import { AuthIdentityPage } from "@blockframes/e2e/pages/auth";
// Hooks
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { NOW, TOMORROW, PRIVATE_EVENTNAME_1, PRIVATE_EVENTNAME_2, PRIVATE_EVENTNAME_3, USER_1, USER_2, ORG_NAME, PUBLIC_EVENTNAME } from '../../fixtures/data';
import { MOVIES } from '@blockframes/e2e/utils/movies';
import { EVENTS } from '@blockframes/e2e/utils/screenings';
import { User as UserType } from '@blockframes/e2e/utils/type';
import { User, QueryInferface } from '../../fixtures';

let tomorrow = new Date(new Date().setDate(NOW.getDate() + 1));;
let users: Partial<UserType>[];
const MOVIE_TITLE = MOVIES[3].title.international;
const userFixture = new User();
users = [ 
  (userFixture.get({key:'email', value: EVENTS[0].by.email})[0])
];

describe('User create a screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    tomorrow = new Date(NOW);
    const p1 = new LandingPage();
    p1.clickSignup();      
  });

  it.only('User Jean Felix logs in, creates 4 screening events', () => {
    // cy.visit('/');
    // const p1 = new LandingPage();
    // p1.clickSignup();   
    const userMarket = userFixture.get({exist: true, 
      key: 'email', value: 'jeanfelix@fake.com' });
    signIn(userMarket[0], true);    
    //cy.visit('/');
    //cy.wait(1000);
    //cy.get('button[test-id=menu]').click();
    // cy.get('a[test-id="calendar"]').then(el => {
    //   cy.log(el.text());
    //   console.log(el);
    // })
    (new FestivalMarketplaceHomePage()).goToDashboard();
    const marketPage = new FestivalDashboardHomePage();
    const eventPage: EventPage = marketPage.goToCalendar();

    //TODO: refactor this to within Dashboard home
    cy.log('Navigating to calendar');
    cy.get('a[test-id="calendar"]').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]').click();
        cy.get('a[test-id="calendar"]').click();
      }
      cy.wait(1000);
      cy.get('button[test-id="menu"]', {timeout: 1200}).first().click();

      [[0, NOW, false], [1, NOW, true], 
      [0, tomorrow, true], [1, tomorrow, false]].forEach((x: any, index:number) => {
          let [i, d, p] = x;
          let eventName = EVENTS[i].event + index;
          eventPage.createEvent(eventName, d, 
                  EVENTS[i].movie.title.international, p);
      });
    });

    //Create a public screening, today
    //eventPage.createEvent(PUBLIC_EVENTNAME, NOW, 'VIRTUAL CANNES PRESENTATION', true);

    //Create a private screening, tomorrow
    //eventPage.createEvent(PRIVATE_EVENTNAME_2, tomorrow, 'VIRTUAL CANNES PRESENTATION');

    //Create a public screening, tomorrow
    //eventPage.createEvent(PRIVATE_EVENTNAME_3, tomorrow, 'VIRTUAL CANNES PRESENTATION');
  })  

  it('User creates a private screening, that taking place tomorrow', () => {
    const userMarket = userFixture.get({exist: true, 
      key: 'email', value: 'vchoukroun@fake.com' })[0];
    signIn(userMarket, true);
    cy.url().then(afterLoginURL => {
      cy.log(afterLoginURL);
      if (afterLoginURL.includes('auth/identity')) {
        const pIdentity = new AuthIdentityPage();
        pIdentity.confirm(userMarket);
      }
      const p1 = new FestivalDashboardHomePage();
      const p2: EventPage = p1.goToCalendar();
      const p3: EventEditPage = p2.createDetailedEvent(NOW);
      p3.addEventTitle(PRIVATE_EVENTNAME_1);
      p3.selectMovie(MOVIE_TITLE);
      p3.saveEvent();      
    });    
  });

  it('User creates a public screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(NOW);
    p3.addEventTitle(PUBLIC_EVENTNAME);
    p3.uncheckPrivate();
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });

  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(tomorrow);
    p3.addEventTitle(PRIVATE_EVENTNAME_2);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });

  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(tomorrow);
    p3.addEventTitle(PRIVATE_EVENTNAME_3);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });

  it.only('Verify the screening page and created screenings', () => {
    // clearDataAndPrepareTest('/');
    // const px = new LandingPage();
    // px.clickSignup();   
    const userMarket = userFixture.get({exist: true, 
      key: 'email', value: 'vchoukroun@fake.com' });
    signIn(userMarket[0]);    
    //cy.visit('/');
    //signIn(USER_2);
    const event1 = EVENTS[0].event;
    const event2 = EVENTS[1].event;
    let eventNames: string[] = [event1+'0', event2+'1',
            event1+'2', event2+'3',];

    // cy.log(userMarket[0].email);
    (new FestivalMarketplaceHomePage()).goToDashboard();
    (new FestivalDashboardHomePage).goToMarket();
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    // p4.assertScreeningsExists([PRIVATE_EVENTNAME_1, PUBLIC_EVENTNAME]);
    //p4.assertScreeningsExists([PUBLIC_EVENTNAME]);
    //p4.assertScreeningsExists(PRIVATE_EVENTNAME_2);
    //p4.assertScreeningsExists(PRIVATE_EVENTNAME_3);
    //p4.assertScreeningsExists(PUBLIC_EVENTNAME);
    p4.checkEventsInMarket(eventNames);

    // TODO: #2689 verify the eventName in each event view page
    // const p5: FestivalMarketplaceEventPage = p4.clickSpecificEvent(PUBLIC_EVENTNAME);
    // p5.assertEventNameExist(PUBLIC_EVENTNAME);
    // const p6: FestivalScreeningPage = p5.clickBackToEventList();

    // const p7: FestivalMarketplaceEventPage = p6.clickSpecificEvent(PRIVATE_EVENTNAME_1);
    // p7.assertEventNameExist(PRIVATE_EVENTNAME_1);
    // const p8: FestivalScreeningPage = p7.clickBackToEventList();

    // const p9: FestivalMarketplaceEventPage = p8.clickSpecificEvent(PRIVATE_EVENTNAME_2);
    // p9.assertEventNameExist(PRIVATE_EVENTNAME_2);
    // const p10: FestivalScreeningPage = p9.clickBackToEventList();

    // const p11: FestivalMarketplaceEventPage = p10.clickSpecificEvent(PRIVATE_EVENTNAME_3);
    // p11.assertEventNameExist(PRIVATE_EVENTNAME_3);
    // const p12: FestivalScreeningPage = p11.clickBackToEventList();
    // p4.checkEventsInMarket([PUBLIC_EVENTNAME, PRIVATE_EVENTNAME_1]);

    p4.checkEventsInMarket(eventNames);
  });

  it("Request invitation's screening", () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    p4.clickAskForInvitation();
  });

  it('Accept screening request', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: FestivalInvitationsPage = p1.clickOnInvitations();
    p2.acceptInvitationScreening();
  });

  it('Verify that request is accepted', () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalMarketplaceNotificationsPage = p1.goToNotifications();
    // Wait notifications
    cy.wait(8000);
    p2.verifyNotification(ORG_NAME, true);
  });

  it.skip('Create Screening', () => {
    clearDataAndPrepareTest('/');
    const px = new LandingPage();
    px.clickSignup();   
    const userMarket = userFixture.get({exist: true, 
      key: 'email', value: 'vchoukroun@fake.com' });
    signIn(userMarket[0]);    
    cy.visit('/');

    const marketPage = new FestivalDashboardHomePage();
    const eventPage: EventPage = marketPage.goToCalendar();
    eventPage.createEvent(PRIVATE_EVENTNAME_1, NOW, 'VIRTUAL CANNES PRESENTATION');    

  })

  // #2695
  it('User add public screening to his calendar', () => {
    const screeningEvent = EVENTS[0].event;
    const movieTitle = EVENTS[0].movie.title.international;
    cy.visit('/');
    //signIn(USER_2);
    (new FestivalDashboardHomePage).goToMarket();
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    cy.log(`[A]: schedule screening of {${screeningEvent}}`);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    p4.clickAddToCalendar(screeningEvent);
    p4.clickOnMenu();
    const p5: FestivalMarketplaceCalendarPage = p4.selectCalendar();
    const p6: FestivalMarketplaceEventPage = p5.clickOnEvent(movieTitle);
    //cy.wait(5000);
    cy.log(`{${movieTitle}} must exist in user schedule! | [A]`);
    p6.assertScreeningExist(movieTitle);
  });
});
