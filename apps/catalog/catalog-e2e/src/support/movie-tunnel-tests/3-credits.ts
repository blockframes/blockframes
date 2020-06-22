import { TunnelCreditsPage, TunnelBudgetPage } from "../pages/dashboard";

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
const ROLES = ['Executive Producer', 'Score Composer', 'Costume Designer'];

export const creditsTest = () => {
  const p1 = new TunnelCreditsPage();

  // Production year
  p1.fillProductionYear(PRODUCTION_YEAR);
  p1.assertProductionYearExists(PRODUCTION_YEAR);

  // Production company
  p1.fillFirstProductioncompany(PRODUCTION, STAKEHOLDERS[0]);
  p1.assertFirstProductioncompanyExists(PRODUCTION, STAKEHOLDERS[0]);
  p1.fillFirstCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[0]);
  p1.selectCountryProductioncompany(COUNTRIES[0]);
  p1.assertFirstCountryProductioncompanyExists(PRODUCTION, COUNTRIES[0]);
  p1.clickAddProductioncompany(PRODUCTION, );
  p1.fillLastProductioncompany(PRODUCTION, STAKEHOLDERS[1]);
  p1.assertLastProductioncompanyExists(PRODUCTION, STAKEHOLDERS[1]);
  p1.fillLastCountryProductioncompany(PRODUCTION, PARTIAL_COUNTRIES[1]);
  p1.selectCountryProductioncompany(COUNTRIES[1]);
  p1.assertLastCountryProductioncompanyExists(PRODUCTION, COUNTRIES[1]);

  // Co-production company
  p1.fillFirstProductioncompany(CO_PRODUCTION, STAKEHOLDERS[2]);
  p1.assertFirstProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[2]);
  p1.fillFirstCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[2]);
  p1.selectCountryProductioncompany(COUNTRIES[2]);
  p1.assertFirstCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[2]);
  p1.clickAddProductioncompany(CO_PRODUCTION, );
  p1.fillLastProductioncompany(CO_PRODUCTION, STAKEHOLDERS[3]);
  p1.assertLastProductioncompanyExists(CO_PRODUCTION, STAKEHOLDERS[3]);
  p1.fillLastCountryProductioncompany(CO_PRODUCTION, PARTIAL_COUNTRIES[3]);
  p1.selectCountryProductioncompany(COUNTRIES[3]);
  p1.assertLastCountryProductioncompanyExists(CO_PRODUCTION, COUNTRIES[3]);

  // Producer
  p1.fillFirstSalesCastFirstName(PRODUCER, PRODUCERS[0]);
  p1.assertFirstSalesCastFirstNameExists(PRODUCER, PRODUCERS[0]);
  p1.fillFirstSalesCastLastName(PRODUCER, PRODUCERS[1]);
  p1.assertFirstSalesCastLastNameExists(PRODUCER, PRODUCERS[1]);
  p1.clickSelectFirstSalesCastRole(PRODUCER);
  p1.selectSalesCastRole(ROLES[0]);
  p1.assertFirstSalesCastRoleExists(PRODUCER, ROLES[0]);

  // Crew member
  p1.fillFirstSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[0]);
  p1.assertFirstSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[0]);
  p1.fillFirstSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[1]);
  p1.assertFirstSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[1]);
  p1.clickSelectFirstSalesCastRole(CREW_MEMBER);
  p1.selectSalesCastRole(ROLES[1]);
  p1.assertFirstSalesCastRoleExists(CREW_MEMBER, ROLES[1]);
  p1.clickAddSalesCast(CREW_MEMBER);
  p1.fillLastSalesCastFirstName(CREW_MEMBER, CREW_MEMBERS[2]);
  p1.assertLastSalesCastFirstNameExists(CREW_MEMBER, CREW_MEMBERS[2]);
  p1.fillLastSalesCastLastName(CREW_MEMBER, CREW_MEMBERS[3]);
  p1.assertLastSalesCastLastNameExists(CREW_MEMBER, CREW_MEMBERS[3]);
  p1.clickSelectLastSalesCastRole(CREW_MEMBER);
  p1.selectSalesCastRole(ROLES[2]);
  p1.assertLastSalesCastRoleExists(CREW_MEMBER, ROLES[2]);

  // Go on movie tunnel budget page
  const p2: TunnelBudgetPage = p1.clickNext();
};
