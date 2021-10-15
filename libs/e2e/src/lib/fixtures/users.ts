import { User as UserType } from '../utils/type';
import { QueryInferface } from "../utils/queryinterface";
import userFixture from 'tools/fixtures/users.json';

export enum USER {
  Vincent = 'MDnN2GlVUeadIVJbzTToQQNAMWZ2',
  Jean = '2OJUZoWtTVcew27YDZa8FQQdg5q2',
  Ivo = 'K0ZCSd8bhwcNd9Bh9xJER9eP2DQ2',
  Daphney = 'B8UsXliuxwY6ztjtLuh6f7UD1GV2',
  Camilla = 'qFbytROWQYWJplzck42RLdgAr3K3'
}

const newUsers: Partial<UserType>[] = [
  {
    firstName: "Mano",
    lastName: "Bangera",
    email: "mano@blockframes.com",
    password: "blockframes"
  }
]

export class User {

  get(query: QueryInferface) : Partial<UserType>[] {
    const userSet: Partial<UserType>[]  = (query.exist) ?
                                          userFixture : newUsers;

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

  /**
   * getByUID : convenience method to signed up user by UID
   * @param uid : uid of the user
   */
  getByUID(uid: string) : Partial<UserType> {
    return this.get({exist: true, key:'uid', value: uid})[0];
  }
}
