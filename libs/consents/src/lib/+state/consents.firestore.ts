
interface Consents<D> {
  access: Access<D>[],
  id: string, // Id of consents document should be the orgId or uId
  share: Share<D>[]
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


