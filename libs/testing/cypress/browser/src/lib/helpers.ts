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
