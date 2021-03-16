import { Organization } from '../utils/type';
import { QueryInferface } from "../utils/queryinterface";
import orgsFixture from 'tools/fixtures/orgs.json';

export enum ORG {
  Xara = 'sLchj1Ib4Cxhwr0ZBW4m',
  GG = 'emaVtLWE8YFK3AQo2CaS',
}

export class Orgs {
  get(query: QueryInferface) : Partial<Organization>[] {
    const orgSet: Partial<Organization>[] =
                  (query.exist) ? orgsFixture : null;

    if (query.index && query.index !== -1) {
      return [orgSet[query.index]];
    }

    if (query.key) {
      return orgSet.filter(u => u[query.key] === query.value);
    }

    return orgSet;
  }

  /**
   * getByID : convenience method to signed up org by ID
   * @param ID : id of the org
   */
  getByID(ID: string) : Partial<Organization> {
    return this.get({exist: true, key:'id', value: ID})[0];
  }

}

export const ORGANIZATION: Organization = {
  id: 'Cy1234',
  email: `dev+${Date.now()}@cascade8.com`,
  address: {
    street: '42 test road',
    zipCode: '69001',
    city: 'Testville',
    country: 'France',
    phoneNumber: '+334 857 953'
  },
  activity: 'Distribution',
  fiscalNumber: '95 14 958 641 215 C',

  denomination: {
    full: `Cypress & Party - ${Date.now()}`,
    public: 'Cypress & Party'
  }
};
