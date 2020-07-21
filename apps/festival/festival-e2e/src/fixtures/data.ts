import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';

export const NOW = new Date();
export let TOMORROW = new Date(NOW);
export const ORG_NAME = 'Curtis, Klein and Romero';
export const PRIVATE_EVENTNAME = 'Private Event';
export const PUBLIC_EVENTNAME = 'Public Event';

export const PARTICIPANT_1_NAME = 'John Briant';
export const PARTICIPANT_1_NOTIFICATION_NAME = 'Briant John';
export const PARTICIPANT_2_NAME = 'Gregory Sarah';
export const PARTICIPANT_2_NOTIFICATION_NAME = 'Sarah Gregory';

// wendy.baker@curtis-klein-and-romero.fake.cascade8.com
export const USER_1: Partial<User> = USERS[45];
// john.bryant@love-and-sons.fake.cascade8.com
export const USER_2: Partial<User> = USERS[4];
// sarah.gregory@turner-gray.fake.cascade8.com
export const USER_3: Partial<User> = USERS[32];
// pamela.cooper@gillespie-lawrence.fake.cascade8.com
export const USER_4: Partial<User> = USERS[1];
