import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';
import faker from '@faker-js/faker';

export const fakeUserData = () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName, `${serverId}.mailosaur.net`).toLowerCase();
  return {
    firstName,
    lastName,
    email,
    uid: '0-tempUid',
    country: 'france',
    password: USER_FIXTURES_PASSWORD,
    company: {
      name: `${firstName} ${lastName} corporation`,
      activity: 'organization',
      country: 'france',
    },
    role: 'buyer',
    indicator: '+33',
    phone: '123456789',
  };
};

export function createFakeUserDataArray(number: number) {
  const fakeUserDataArray = [];
  for (let i = 0; i < number; i++) {
    fakeUserDataArray.push(fakeUserData());
  }
  return fakeUserDataArray;
}

export const fakeMovieTitle = (suffix = 'movie') => `E2E ${faker.lorem.slug(3).replace(/-/g, ' ')} ${suffix}`;

export const fakeOrgName = () => `E2E_${faker.lorem.slug(3)} org`;

export const fakeFirstName = () => `E2E_${faker.name.firstName()}`;

export const fakeLastName = () => `E2E_${faker.name.lastName()}`;

export const fakeKeyword = () => `E2E ${faker.word.noun()}`;

/**
 * Take a Date as input and convert it into en-US string with two digits for month and day.
 * @example: 01/01/2024
 **/
export function dateToMMDDYYYY(date: Date) {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/**
 * Transform the first letter of each word to uppercase
 * @example: a magic letter => A Magic Letter
 **/
export const titleCase = (str: string) =>
  str
    .split(' ')
    .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(' ');
