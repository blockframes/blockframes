export type ConsentType = 'access' | 'share';

export interface Consents {
  access: Access[],
  id: string, // Id of consents document should be the orgId or uId
  share: Share[]
}

export interface Access {
  date: Date,
  docId: string,
  email: string,
  filePath: string,
  firstName: string,
  ip: string,
  lastName: string,
  userId: string
}

export interface Share {
  date: Date,
  docId: string,
  email: string,
  firstName: string,
  ip: string,
  lastName: string,
  userId: string
}

export function createAccess(access: Partial<Access> = {}): Access {
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

export function createShare(share: Partial<Share> = {}): Share {
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

export function createConsent(consent: Partial<Consents> = {}): Consents {
  return {
    access: [],
    id: '',
    share: [],
    ...consent,
  };
}
