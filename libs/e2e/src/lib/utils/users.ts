import { User } from './type';
//@George import is fine.. but gives error while running test
//webpack error.
import userFixture from 'tools/users.fixture.json';

export const USERS: Partial<User>[] = userFixture;
