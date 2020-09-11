import { Screening } from './type';

export const EVENTS: Partial<Screening>[] = [
  {
    event: 'Felicità Private Screening',
    by : {
      uid: '2OJUZoWtTVcew27YDZa8FQQdg5q2'
    },
    movie: { 
      title: {
        international: 'Felicità'
      }
    },
    org : {
      name: 'Charades'
    },
    invitees: [{
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
      title: {
        international: 'Hunted'
      }
    },
    org : {
      name: 'Charades'
    },
    invitees: [{
        uid: 'MDnN2GlVUeadIVJbzTToQQNAMWZ2'
      }, {
        
      }
    ],
    private: true
  },
];
