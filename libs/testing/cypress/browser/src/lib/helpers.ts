import { serverId } from '@blockframes/utils/constants';
import faker from '@faker-js/faker';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';
import { UserRole, App, ModuleAccess } from '@blockframes/model';
import { startOfWeek, add, isPast, isFuture } from 'date-fns';

export function createFakeUserData() {
  const firstname = faker.name.firstName();
  const lastname = faker.name.lastName();
  const email = faker.internet.email(firstname, lastname, `${serverId}.mailosaur.net`).toLowerCase();
  return {
    firstname,
    lastname,
    email,
    country: 'France',
    password: USER_FIXTURES_PASSWORD,
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

//* DASHBOARD FUNCTIONS *//

export function createFutureSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = new Date().getDay() + Math.floor(Math.random() * (7 - new Date().getDay()));
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isFuture(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

// not used yet, need to wait for issue #8203 to be resolved
export function createPastSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = Math.floor(Math.random() * new Date().getDay());
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isPast(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

export function getCurrentWeekDays() {
  const d = new Date();
  const weekDays: { day: string; date: string }[] = [];
  d.setDate(d.getDate() - d.getDay());
  for (let i = 0; i < 7; i++) {
    weekDays.push({
      day: d.toLocaleString('en-us', { weekday: 'long' }),
      date: `${new Date(d).toLocaleString('en-us', { month: 'short' })} ${new Date(d).getDate()}`,
    });
    d.setDate(d.getDate() + 1);
  }
  return weekDays;
}

//* INTERFACES *//

export interface EventSlot {
  day: number;
  hours: number;
  minutes: 0 | 30;
}

export interface AppAndUserType {
  app: App;
  access: ModuleAccess;
  userType: UserRole;
}
