// ***********************************************************
// Primary import for all fixtures
//
// All fixtures should support the Query Inteface
// ***********************************************************
import Users from '../../../../../tools/fixtures/users.json'
import { User as UserType } from '@blockframes/e2e/utils/type';
import { QueryInferface } from "./queryinterface";

export default class User {
  newUsers: Partial<UserType>[];

  constructor() {
    this.newUsers = [];
    this.newUsers.push({
      email: 'mano@blockframes.com',
      password: 'blockframes'
    });
  }

  get(query: QueryInferface) : Partial<UserType>[] {
    let userSet = (query.exist) ? Users : this.newUsers;

    if (query.index && query.index != -1) {
      return [userSet[query.index]];
    }

    return userSet;
  }

}
