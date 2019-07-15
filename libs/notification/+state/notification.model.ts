// tslint:disable-next-line: interface-over-type-literal
export type Notification = {
  id: string;
  app: string;
  message: string;
  userId: string[];
  path: string;
  docID: DocID;
  isRead: boolean;
  date: number;
};

interface DocID {
  id: string,
  type : 'movie' | 'delivery'
}
