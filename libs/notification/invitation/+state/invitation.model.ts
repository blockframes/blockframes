export interface Invitation {
  id: string;
  app: string;
  message: string;
  userId: string[];
  path: string;
  docID: DocID;
  isAccepted: 'accepted' | 'declined' | 'pending';
  date: number;
};

interface DocID {
  id: string,
  type : 'movie' | 'delivery'
}
