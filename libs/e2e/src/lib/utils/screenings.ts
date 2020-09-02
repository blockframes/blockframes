import { Screening } from './type';

export const EVENTS: Partial<Screening>[] = [
  {
    event: 'Felicità Private Screening',
    by : {
      email: 'jeanfelix@fake.com'
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
        email: 'vchoukroun@fake.com'
      }, {
        email: 'concierge+dkmediaconsulting@fake.com'
      }
    ],
    private: true
  },
  {
    event: 'Hunted Screening',
    by : {
      email: 'jeanfelix@fake.com'
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
        email: 'vchoukroun@fake.com'
      }, {
        
      }
    ],
    private: true
  },
];
