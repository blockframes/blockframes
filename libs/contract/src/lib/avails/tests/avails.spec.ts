
import { BucketTerm } from '@blockframes/contract/term/+state';

import { AvailsFilter, isMovieAvailable } from './../avails';


const mandateTermA: BucketTerm = {
  medias: [ 'payTv', 'boats' ],
  duration: {
    from: new Date(2),
    to: new Date(42)
  },
  territories: [ 'france', 'united-kingdom' ],
  exclusive: true,
  languages: {},
};

const availsOK: Partial<AvailsFilter>[] = [
  {},

  { territories: [ 'france' ] },
  { territories: [ 'france', 'united-kingdom' ] },

  { medias: [ 'payTv' ] },
  { medias: [ 'payTv', 'boats' ] },

  { duration: { from: new Date(2), to: new Date(42) } },
  { duration: { from: new Date(2), to: new Date(24) } },
  { duration: { from: new Date(15), to: new Date(42) } },
  { duration: { from: new Date(15), to: new Date(24) } },
];

const availsNotOK: Partial<AvailsFilter>[] = [

  { territories: [ 'germany' ] },
  { territories: [ 'france', 'germany' ] },
  { territories: [ 'france', 'united-kingdom', 'germany' ] },

  { medias: [ 'planes' ] },
  { medias: [ 'payTv', 'planes' ] },
  { medias: [ 'payTv', 'boats', 'planes' ] },

  { duration: { from: new Date(2), to: new Date(62) } },
  { duration: { from: new Date(0), to: new Date(24) } },
  { duration: { from: new Date(0), to: new Date(62) } },
];

describe('Avails', () => {
  describe('Test avails collision', () => {
    it('should work', () => {
      for (const avail of availsOK) {
        const available = isMovieAvailable('', avail as AvailsFilter, undefined, [mandateTermA], [], 'optional');
        expect(available).toBeTruthy();
      }
    });
    it('should not work', () => {
      for (const avail of availsNotOK) {
        const available = isMovieAvailable('', avail as AvailsFilter, undefined, [mandateTermA], [], 'optional');
        expect(available).toBeFalsy();
      }
    });
  })
});
