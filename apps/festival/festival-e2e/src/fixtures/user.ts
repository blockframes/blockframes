// ***********************************************************
// Primary import for all fixtures
//
// All fixtures should support the Query Inteface
// ***********************************************************
//import Users from '../../../../../tools/fixtures/users.json'
import { User as UserType } from '@blockframes/e2e/utils/type';
import { QueryInferface } from "./queryinterface";

export default class User {
  newUsers: Partial<UserType>[];

  constructor() {
    this.newUsers = [];
    this.newUsers.push({
      firstName: 'Mano',
      lastName: 'Bangera',
      email: 'mano@blockframes.com',
      password: 'blockframes'
    });
  }

  get(query: QueryInferface) : Partial<UserType>[] {
    let Users = null;
    let userSet: Partial<UserType>[]  = (query.exist) ? 
                                        Users : this.newUsers;

    if (query.index && query.index != -1) {
      return [userSet[query.index]];
    }

    if (query.key) {
      const resultsUser = userSet.filter(u => 
                          (u[query.key] === query.value));
      return resultsUser;
    }

    return userSet;
  }

}
