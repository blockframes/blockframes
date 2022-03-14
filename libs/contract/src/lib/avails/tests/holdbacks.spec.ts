import { Media, Territory } from '@blockframes/utils/static-model';
import { collidingHoldback, getCollidingHoldbacks } from '../avails';
import { Duration, Term, createTerm } from '../../term/+state/term.model';
import { createHoldback, Holdback } from '@blockframes/model';

// Territories
const nonCollidingTerritoriesA: Territory[] = [
  'argentina', 'armenia', 'aruba', 'australia',
  'austria', 'azerbaijan', 'bahamas', 'bahrain',
  'bangladesh', 'barbados', 'belarus', 'belgium',
  'belize', 'benin', 'bermuda', 'bhutan', 'bolivia', 'botswana', 'brazil',
]
const nonCollidingTerritoriesB: Territory[] = [
  'kyrgyzstan', 'laos', 'latvia', 'lebanon',
  'lesotho', 'liberia', 'libya', 'liechtenstein',
  'lithuania', 'luxembourg', 'macao', 'madagascar',
  'malawi', 'malaysia', 'maldives', 'mali', 'malta',
  'marshall', 'martinique', 'mauritania', 'mauritius',
  'mexico', 'micronesia',
]
const collidingTerritoriesA = nonCollidingTerritoriesA
const collidingTerritoriesB = [...nonCollidingTerritoriesB, collidingTerritoriesA[0]]

// Durations
const nonCollidingBeforeDurationA: Duration = { from: new Date('01/01/2028'), to: new Date('06/30/2029') };
const nonCollidingBeforeDurationB: Duration = { from: new Date('07/01/2029'), to: new Date('08/01/2029') };
const nonCollidingAfterDurationA: Duration = { from: new Date('07/01/2029'), to: new Date('08/01/2029') };
const nonCollidingAfterDurationB: Duration = { from: new Date('01/01/2028'), to: new Date('06/30/2029') };
const collidingDurationA: Duration = { from: new Date('01/01/2030'), to: new Date('06/30/2030') };
const collidingDurationB: Duration = { from: new Date('06/01/2030'), to: new Date('08/01/2030') };

// Medias
const nonCollidingMediaA: Media[] = [
  'payTv', 'freeTv', 'payPerView', 'est', 'nVod', 'aVod', 'fVod',
]
const nonCollidingMediaB: Media[] = [
  'theatrical', 'video', 'planes', 'boats', 'hotels', 'educational', 'rental',
]
const collidingMediaA = nonCollidingMediaA
const collidingMediaB = [...nonCollidingMediaB, collidingMediaA[0]]

// Holdbacks and terms
const nonCollidingHoldback: Holdback = createHoldback({
  territories: nonCollidingTerritoriesA,
  medias: nonCollidingMediaA,
  duration: nonCollidingBeforeDurationA,
})
const nonCollidingTerm: Term = createTerm({
  territories: nonCollidingTerritoriesB,
  medias: nonCollidingMediaB,
  duration: nonCollidingBeforeDurationB,
})
const collidingAllHoldback: Holdback = createHoldback({
  territories: collidingTerritoriesA,
  medias: collidingMediaA,
  duration: collidingDurationA,
})
const collidingAllTerm: Term = createTerm({
  territories: collidingTerritoriesB,
  medias: collidingMediaB,
  duration: collidingDurationB,
})
const collidingTerritoriesHoldback: Holdback = createHoldback({
  territories: collidingTerritoriesA,
  medias: nonCollidingMediaA,
  duration: nonCollidingBeforeDurationA,
})
const collidingTerritoriesTerm: Term = createTerm({
  territories: collidingTerritoriesB,
  medias: nonCollidingMediaB,
  duration: nonCollidingBeforeDurationB,
})
const collidingMediasHoldback: Holdback = createHoldback({
  territories: nonCollidingTerritoriesA,
  medias: collidingMediaA,
  duration: nonCollidingAfterDurationA,
})
const collidingMediasTerm: Term = createTerm({
  territories: nonCollidingTerritoriesB,
  medias: collidingMediaB,
  duration: nonCollidingAfterDurationB,
})
const collidingDurationHoldback: Holdback = createHoldback({
  territories: nonCollidingTerritoriesA,
  medias: nonCollidingMediaA,
  duration: collidingDurationA,
})
const collidingDurationTerm: Term = createTerm({
  territories: nonCollidingTerritoriesB,
  medias: nonCollidingMediaB,
  duration: collidingDurationA,
})


// Holdback[] and term[]

const nonCollidingHoldbacks = [
  nonCollidingHoldback,
  collidingTerritoriesHoldback,
  collidingMediasHoldback,
]
const nonCollidingTerms = [
  nonCollidingTerm, collidingTerritoriesTerm,
  collidingMediasTerm, collidingDurationTerm,
]
const collidingHoldbacks = [
  ...nonCollidingHoldbacks,
  collidingAllHoldback,
]
const collidingTerms = [
  ...nonCollidingTerms,
  collidingAllTerm,
]

describe('Holdbacks', () => {
  describe('Test collidingHoldback pure function', () => {
    it('Checks no colliding holdback', () => {
      expect(collidingHoldback(nonCollidingHoldback, nonCollidingTerm)).toBe(false);
    });
    it('Checks no colliding territories', () => {
      expect(collidingHoldback(collidingTerritoriesHoldback, collidingTerritoriesTerm)).toBe(false);
    });
    it('Checks no colliding medias', () => {
      expect(collidingHoldback(collidingMediasHoldback, collidingMediasTerm)).toBe(false);
    });
    it('Checks no colliding duration', () => {
      expect(collidingHoldback(collidingDurationHoldback, collidingDurationTerm)).toBe(false);
    });
    it('Checks colliding holdback', () => {
      expect(collidingHoldback(collidingAllHoldback, collidingAllTerm)).toBe(true);
    });
  });

  describe('Test getCollidingHoldbacks pure function', () => {
    it('Checks no colliding holdbacks', () => {
      expect(getCollidingHoldbacks(nonCollidingHoldbacks, nonCollidingTerms)).toHaveLength(0);
    });
    it('Checks 2 colliding holdbacks', () => {
      expect(getCollidingHoldbacks(collidingHoldbacks, collidingTerms)).toHaveLength(1);
    });
  });
});
