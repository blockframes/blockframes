
import { AvailsFilter, availableTitle, FullMandate } from '../avails';

const mandate = {
  titleId: 'titleA',
  id: 'mandateA',
  termIds: ['termA'],
  terms: [{
    id: 'termA',
    contractId: 'mandateA',
    medias: [ 'payTv', 'boats' ],
    duration: {
      from: new Date(2),
      to: new Date(42)
    },
    territories: [ 'france', 'united-kingdom' ],
    exclusive: true,
  }],
} as FullMandate;

const availsOK: AvailsFilter[] = [

  { territories: [ 'france' ], medias: [ 'payTv'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },
  { territories: [ 'united-kingdom' ], medias: [ 'boats'], duration: { from: new Date(15), to: new Date(24) }, exclusive: true },
  { territories: [ 'france', 'united-kingdom' ], medias: [ 'boats'], duration: { from: new Date(5), to: new Date(41) }, exclusive: true },
  { territories: [ 'united-kingdom' ], medias: [ 'payTv', 'boats'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },
  { territories: [ 'france', 'united-kingdom' ], medias: [ 'payTv', 'boats'], duration: { from: new Date(41), to: new Date(42) }, exclusive: true },

];

const availsNotOK: AvailsFilter[] = [

  { territories: [ 'germany' ], medias: [ 'payTv'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },
  { territories: [ 'france', 'germany' ], medias: [ 'payTv'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },

  { territories: [ 'france' ], medias: [ 'planes'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },
  { territories: [ 'france' ], medias: [ 'planes', 'boats'], duration: { from: new Date(2), to: new Date(42) }, exclusive: true },

  { territories: [ 'france' ], medias: [ 'payTv'], duration: { from: new Date(2), to: new Date(62) }, exclusive: true },
  { territories: [ 'france' ], medias: [ 'payTv'], duration: { from: new Date(0), to: new Date(24) }, exclusive: true },

  { territories: [ 'germany' ], medias: [ 'planes'], duration: { from: new Date(0), to: new Date(24) }, exclusive: true },

];

describe('Avails', () => {
  describe('Test avails collision', () => {
    it('should work', () => {
      for (const avail of availsOK) {
        const availableMandates = availableTitle(avail, [mandate], []);
        expect(availableMandates.length).toBe(1);
      }
    });
    it('should not work', () => {
      for (const avail of availsNotOK) {
        const availableMandates = availableTitle(avail, [mandate], []);
        expect(availableMandates.length).toBe(0);
      }
    });
  })
});
