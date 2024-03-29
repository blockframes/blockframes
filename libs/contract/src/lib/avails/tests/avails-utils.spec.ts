import { Term, isCalendarAvailPartiallyInTerm } from '@blockframes/model'
import { availsBrewster3 } from '../fixtures/availsFilters';

const nonOverlappingTerm: Term = {
  id: 'term',
  contractId: 'sale2Movie7',
  duration: {
    from: new Date('01/01/2024'),
    to: new Date('12/31/2026')
  },
  medias: ['inflight'],
  territories: ['japan'],
  exclusive: true,
  criteria: [],
  languages: {},
  licensedOriginal: true
};

const overlappingTerm: Term = {
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
    const overlapping = isCalendarAvailPartiallyInTerm(overlappingTerm, availsBrewster3);
    const nonOverlapping = isCalendarAvailPartiallyInTerm(nonOverlappingTerm, availsBrewster3);
    expect(nonOverlapping).toBe(false);
    expect(overlapping).toBe(true);
  });
});
