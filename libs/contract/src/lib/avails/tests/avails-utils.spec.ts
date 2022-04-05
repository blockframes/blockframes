import { Term } from '@blockframes/model'
import { availsBrewster3 } from '../fixtures/availsFilters';
import { isCalendarAvailPartiallyInTerm } from '../avails'

const nonOverlappingTerm: Term<Date> = {
  id: 'term',
  contractId: 'sale2Movie7',
  duration: {
    from: new Date('01/01/2024'),
    to: new Date('12/31/2026')
  },
  medias: ['planes'],
  territories: ['japan'],
  exclusive: true,
  criteria: [],
  languages: {},
  licensedOriginal: true
};

const overlappingTerm: Term<Date> = {
  id: 'term1',
  contractId: 'sale2Movie7',
  duration: {
    from: new Date('01/01/2025'),
    to: new Date('12/31/2026')
  },
  medias: ['aVod', 'fVod', 'nVod', 'sVod'],
  territories: ['belgium'],
  exclusive: false,
  criteria: [],
  languages: {},
  licensedOriginal: true
};


describe('test isCalendarAvailPartiallyInTerm', () => {
  it('test overlap between term and avail', () => {
    const overlapping = isCalendarAvailPartiallyInTerm(availsBrewster3, overlappingTerm);
    const nonOverlapping = isCalendarAvailPartiallyInTerm(availsBrewster3, nonOverlappingTerm);
    expect(nonOverlapping).toBe(false);
    expect(overlapping).toBe(true);
  });
});
