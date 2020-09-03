import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';

export const NOW = new Date();
export let TOMORROW = new Date(NOW);
export const ORG_NAME = 'Charades';
export const PRIVATE_EVENTNAME_1 = 'Hunted Private Screening';
export const PRIVATE_EVENTNAME_2 = 'Private Event 2';
export const PRIVATE_EVENTNAME_3 = 'Private Event 3';

export const PUBLIC_EVENTNAME = 'Hunted Public Screening';

export const PARTICIPANT_1_NAME = 'Bryant John';
export const PARTICIPANT_2_NAME = 'Gregory Sarah';

// wendy.baker@curtis-klein-and-romero.fake.cascade8.com
export const USER_1: Partial<User> = USERS[45];
// john.bryant@love-and-sons.fake.cascade8.com
export const USER_2: Partial<User> = USERS[4];
// sarah.gregory@turner-gray.fake.cascade8.com
export const USER_3: Partial<User> = USERS[32];
// pamela.cooper@gillespie-lawrence.fake.cascade8.com
export const USER_4: Partial<User> = USERS[1];
