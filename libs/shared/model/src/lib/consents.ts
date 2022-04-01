export type ConsentType = 'access' | 'share';

export interface Consents<D> {
  access: Access<D>[];
  id: string; // Id of consents document should be the orgId or uId
  share: Share<D>[];
}

export interface Access<D> {
  date: D;
  docId: string;
  email: string;
  filePath: string;
  firstName: string;
  ip: string;
  lastName: string;
  userId: string;
}

export interface Share<D> {
  date: D;
  docId: string;
  email: string;
  firstName: string;
  ip: string;
  lastName: string;
  userId: string;
}

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
    date: access.date,
  };
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
    date: share.date,
  };
}

export function createConsent(consent: Partial<Consents<Date>> = {}): Consents<Date> {
  return {
    access: [],
    id: '',
    share: [],
    ...consent,
  };
}
