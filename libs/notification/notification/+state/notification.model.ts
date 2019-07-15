export interface Notification {
  id: string;
  app: string;
  message: string;
  userId: string[];
  path: string;
  docID: DocID;
  isRead: boolean;
  date: number;
  stakeholderId: string;
};

interface DocID {
  id: string,
  type : 'movie' | 'delivery'
}
