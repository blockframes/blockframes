import { Access, Share, Consents } from './consents.firestore';
import { toDate } from '@blockframes/utils/helpers';

export function createAccess(access: Partial<Access<Date>> = {}): Access<Date> {
  return {
    docId: '',
    email: '',
    filePath: '',
    firstName: '',
    ip: '',
    lastName: '',
    userId: '',
    ...access,
    date: toDate(access.date)
  }
}

export function createShare(share: Partial<Share<Date>> = {}): Share<Date> {
  return {
    docId: '',
    email: '',
    firstName: '',
    ip: '',
    lastName: '',
    userId: '',
    ...share,
    date: toDate(share.date)
  }
}

export function createConsent(consent: Partial<Consents<Date>> = {}): Consents<Date> {
  return {
    access: [],
    id: '',
    share: [],
    ...consent
  }
}
