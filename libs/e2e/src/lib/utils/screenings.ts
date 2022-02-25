import { Screening } from './type';

export const EVENTS: Partial<Screening>[] = [
  {
    event: 'TKOTL Private Screening',
    by : {
      uid: '2OJUZoWtTVcew27YDZa8FQQdg5q2'
    },
    movie: { 
      id: '02L9gsoY4WTdGbxpOKha',
      title: {
        international: 'The Killing Of Two Lovers'
      }
    },
    org : {
      id: 'sLchj1Ib4Cxhwr0ZBW4m',
    },
    invitees: [
      {
        uid: 'MDnN2GlVUeadIVJbzTToQQNAMWZ2'
      }, {
        uid: 'mVUZ097xoAeubsPiQlqrzgUF8y83'
      }
    ],
    private: true
  },
  {
    event: 'Hunted Screening',
    by : {
      uid: '2OJUZoWtTVcew27YDZa8FQQdg5q2'
    },
    movie: {
      id: 'KUFRFI3VQ5HLOdymnEX5',
      title: {
        international: 'Hunted'
      }
    },
    org : {
      id: 'sLchj1Ib4Cxhwr0ZBW4m',
    },
    invitees: [
      {
        uid: 'MDnN2GlVUeadIVJbzTToQQNAMWZ2'
      }
    ],
    private: true
  },
];
