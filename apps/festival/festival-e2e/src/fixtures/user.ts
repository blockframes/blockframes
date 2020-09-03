// ***********************************************************
// Primary import for all fixtures
//
// All fixtures should support the Query Interface
// ***********************************************************
import Users from 'tools/fixtures/users.json'
import NewUsers from './new-users.json';
import { User as UserType } from '@blockframes/e2e/utils/type';
import { QueryInferface } from "./queryinterface";

export default class User {
  newUsers: Partial<UserType>[];

  constructor() {

  }

  get(query: QueryInferface) : Partial<UserType>[] {
    const userSet: Partial<UserType>[]  = (query.exist) ? 
                                        Users : NewUsers;

    if (query.index && query.index !== -1) {
      return [userSet[query.index]];
    }

    if (query.key) {
      return userSet.filter(u => u[query.key] === query.value);
    }

    return userSet;
  }

  /**
   * getByEmail : convenience method to signed up user by emailID
   * @param emailID : email-id of the user
   */
  getByEmail(emailID: string) : Partial<UserType> {
    return this.get({exist: true, key:'email', value: emailID})[0];
  }
}
