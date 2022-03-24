import { serverId } from '@blockframes/utils/constants';
import faker from '@faker-js/faker';

export function createFakeUserData() {
  const firstname = faker.name.firstName();
  const lastname = faker.name.lastName();
  const email = faker.internet.email(firstname, lastname, `${serverId}.mailosaur.net`).toLowerCase();
  return {
    firstname,
    lastname,
    email,
    country: 'France',
    password: 'Blockframes',
    company: {
      name: `${firstname} ${lastname} corporation`,
      activity: 'Organization',
      country: 'France',
    },
    role: 'Buyer',
    indicator: '+33',
    phone: '123456789',
  };
}

export function createFakeUserDataArray(number: number) {
  const fakeUserDataArray = [];
  for (let i = 0; i < number; i++) {
    fakeUserDataArray.push(createFakeUserData());
  }
  return fakeUserDataArray;
}
