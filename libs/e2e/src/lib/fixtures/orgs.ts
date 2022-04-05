import { Organization } from '../utils/type';
import { QueryInferface } from "../utils/queryinterface";
import orgsFixture from 'tools/fixtures/orgs.json';

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
