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
    country: 'France',
    password: USER_FIXTURES_PASSWORD,
    company: {
      name: `${firstName} ${lastName} corporation`,
      activity: 'Organization',
      country: 'France',
    },
    role: 'Buyer',
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
