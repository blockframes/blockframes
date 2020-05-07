import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';
import { signIn } from '@blockframes/e2e/utils/functions';

// Select user: david.ewing@gillespie-lawrence.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User>[] = USERS;

export function signInAndNavigateToMain(id: string) {
  signIn(LOGIN_CREDENTIALS.find(user => user.uid === id));
}
