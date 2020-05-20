import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';

export const NOW = new Date();
export let TOMORROW = new Date(NOW);
export const ORG_NAME = 'main';
export const EVENTNAME = 'test screening';

export const PARTICIPANT_1_NAME = 'John Bryant';
export const PARTICIPANT_2_NAME = 'Sarah Gregory';

// david.ewing@gillespie-lawrence.fake.cascade8.com
export const USER_1: Partial<User> = USERS[0];
// john.bryant@love-and-sons.fake.cascade8.com
export const USER_2: Partial<User> = USERS[4];
// sarah.gregory@turner-gray.fake.cascade8.com
export const USER_3: Partial<User> = USERS[32];
