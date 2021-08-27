
import {
  allOf,
  continuousDisjoint,
  continuousEqual,
  continuousOverlap,
  continuousSubset,
  discreteDisjoint,
  discreteEqual,
  discreteOverlap,
  discreteSubset,
  noneOf,
  someOf,
} from '../sets';

const discrete = {
  a: [ 'apple', 'banana', 'grape' ],
  b: [ 'peach', 'orange', 'pear' ], // different than A

  c: [ 'apple', 'banana', 'grape' ], // same as A
  d: [ 'banana', 'grape' ], // subset of A
  e: [ 'lemon', 'apricot', 'banana' ], // overlap with A

  f: [ 'peach', 'orange', 'pear' ], // same as B
  g: [ 'peach', 'pear' ], // subset of B
  h: [ 'lemon', 'orange', 'apricot' ], // overlap with B
};

const continuous = {
  a: { from: 5, to: 14 },
  b: { from: 23, to: 42 }, // different than A

  c: { from: 5, to: 14 }, // same as A
  d: { from: 7, to: 12 }, // subset of A
  e: { from: 1, to: 9 }, // overlap with A

  f: { from: 23, to: 42 }, // same as B
  g: { from: 26, to: 30 }, // subset of B
  h: { from: 24, to: 59 }, // overlap with B
};

describe('Sets tests', () => {
  describe('Discrete Sets', () => {
    describe('Disjoint', () => {
      it('should succeed with disjoint', () => {
        expect(discreteDisjoint(discrete.a, discrete.b)).toBe(true);
        expect(noneOf(discrete.b).in(discrete.a)).toBe(true);
        expect(discreteDisjoint(discrete.a, discrete.h)).toBe(true);
        expect(noneOf(discrete.h).in(discrete.a)).toBe(true);
      });
      it('should fail with subset', () => {
        expect(discreteDisjoint(discrete.a, discrete.d)).toBe(false);
        expect(noneOf(discrete.d).in(discrete.a)).toBe(false);
        expect(discreteDisjoint(discrete.b, discrete.g)).toBe(false);
        expect(noneOf(discrete.g).in(discrete.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(discreteDisjoint(discrete.a, discrete.e)).toBe(false);
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
        expect(discreteDisjoint(discrete.b, discrete.h)).toBe(false);
        expect(noneOf(discrete.h).in(discrete.b)).toBe(false);
      });
      it('should fail with equal', () => {
        expect(discreteDisjoint(discrete.a, discrete.c)).toBe(false);
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
        expect(discreteDisjoint(discrete.b, discrete.f)).toBe(false);
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
      });
    });
    describe('Subset', () => {
      it('should fail with disjoint', () => {
        expect(discreteSubset(discrete.a, discrete.b)).toBe(false);
        expect(allOf(discrete.b).in(discrete.a)).toBe(false);
        expect(discreteSubset(discrete.a, discrete.h)).toBe(false);
        expect(allOf(discrete.h).in(discrete.a)).toBe(false);
      });
      it('should succeed with subset', () => {
        expect(discreteSubset(discrete.a, discrete.d)).toBe(true);
        expect(allOf(discrete.d).in(discrete.a)).toBe(true);
        expect(discreteSubset(discrete.b, discrete.g)).toBe(true);
        expect(allOf(discrete.g).in(discrete.b)).toBe(true);
      });
      it('should fail with overlap', () => {
        expect(discreteSubset(discrete.a, discrete.e)).toBe(false);
        expect(allOf(discrete.e).in(discrete.a)).toBe(false);
        expect(discreteSubset(discrete.b, discrete.h)).toBe(false);
        expect(allOf(discrete.h).in(discrete.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(discreteSubset(discrete.a, discrete.c)).toBe(true);
        expect(allOf(discrete.c).in(discrete.a)).toBe(true);
        expect(discreteSubset(discrete.b, discrete.f)).toBe(true);
        expect(allOf(discrete.f).in(discrete.b)).toBe(true);
      });
    });
    describe('Overlap', () => {
      it('should fail with disjoint', () => {
        expect(discreteOverlap(discrete.a, discrete.b)).toBe(false);
        expect(someOf(discrete.b).in(discrete.a)).toBe(false);
        expect(discreteOverlap(discrete.a, discrete.h)).toBe(false);
        expect(someOf(discrete.h).in(discrete.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(discreteOverlap(discrete.a, discrete.d)).toBe(false);
        expect(someOf(discrete.d).in(discrete.a)).toBe(true);
        expect(discreteOverlap(discrete.b, discrete.g)).toBe(false);
        expect(someOf(discrete.g).in(discrete.b)).toBe(true);
      });
      it('should succeed with overlap', () => {
        expect(discreteOverlap(discrete.a, discrete.e)).toBe(true);
        expect(someOf(discrete.e).in(discrete.a)).toBe(true);
        expect(discreteOverlap(discrete.b, discrete.h)).toBe(true);
        expect(someOf(discrete.h).in(discrete.b)).toBe(true);
      });
      it('should fail with equal', () => {
        expect(discreteOverlap(discrete.a, discrete.c)).toBe(false);
        expect(someOf(discrete.c).in(discrete.a)).toBe(true);
        expect(discreteOverlap(discrete.b, discrete.f)).toBe(false);
        expect(someOf(discrete.f).in(discrete.b)).toBe(true);
      });
    });
    describe('Equal', () => {
      it('should fail with disjoint', () => {
        expect(discreteEqual(discrete.a, discrete.b)).toBe(false);
        expect(allOf(discrete.b).equal(discrete.a)).toBe(false);
        expect(discreteEqual(discrete.a, discrete.h)).toBe(false);
        expect(allOf(discrete.h).equal(discrete.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(discreteEqual(discrete.a, discrete.d)).toBe(false);
        expect(allOf(discrete.d).equal(discrete.a)).toBe(false);
        expect(discreteEqual(discrete.b, discrete.g)).toBe(false);
        expect(allOf(discrete.g).equal(discrete.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(discreteEqual(discrete.a, discrete.e)).toBe(false);
        expect(allOf(discrete.e).equal(discrete.a)).toBe(false);
        expect(discreteEqual(discrete.b, discrete.h)).toBe(false);
        expect(allOf(discrete.h).equal(discrete.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(discreteEqual(discrete.a, discrete.c)).toBe(true);
        expect(allOf(discrete.c).equal(discrete.a)).toBe(true);
        expect(discreteEqual(discrete.b, discrete.f)).toBe(true);
        expect(allOf(discrete.f).equal(discrete.b)).toBe(true);
      });
    });
  });
  describe('Continuous Sets', () => {
    describe('Disjoint', () => {
      it('should succeed with disjoint', () => {
        expect(continuousDisjoint(continuous.a, continuous.b)).toBe(true);
        expect(noneOf(continuous.b).in(continuous.a)).toBe(true);
        expect(continuousDisjoint(continuous.a, continuous.h)).toBe(true);
        expect(noneOf(continuous.h).in(continuous.a)).toBe(true);
      });
      it('should fail with subset', () => {
        expect(continuousDisjoint(continuous.a, continuous.d)).toBe(false);
        expect(noneOf(continuous.d).in(continuous.a)).toBe(false);
        expect(continuousDisjoint(continuous.b, continuous.g)).toBe(false);
        expect(noneOf(continuous.g).in(continuous.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(continuousDisjoint(continuous.a, continuous.e)).toBe(false);
        expect(noneOf(continuous.e).in(continuous.a)).toBe(false);
        expect(continuousDisjoint(continuous.b, continuous.h)).toBe(false);
        expect(noneOf(continuous.h).in(continuous.b)).toBe(false);
      });
      it('should fail with equal', () => {
        expect(continuousDisjoint(continuous.a, continuous.c)).toBe(false);
        expect(noneOf(continuous.c).in(continuous.a)).toBe(false);
        expect(continuousDisjoint(continuous.b, continuous.f)).toBe(false);
        expect(noneOf(continuous.f).in(continuous.b)).toBe(false);
      });
    });
    describe('Subset', () => {
      it('should fail with disjoint', () => {
        expect(continuousSubset(continuous.a, continuous.b)).toBe(false);
        expect(allOf(continuous.b).in(continuous.a)).toBe(false);
        expect(continuousSubset(continuous.a, continuous.h)).toBe(false);
        expect(allOf(continuous.h).in(continuous.a)).toBe(false);
      });
      it('should succeed with subset', () => {
        expect(continuousSubset(continuous.a, continuous.d)).toBe(true);
        expect(allOf(continuous.d).in(continuous.a)).toBe(true);
        expect(continuousSubset(continuous.b, continuous.g)).toBe(true);
        expect(allOf(continuous.g).in(continuous.b)).toBe(true);
      });
      it('should fail with overlap', () => {
        expect(continuousSubset(continuous.a, continuous.e)).toBe(false);
        expect(allOf(continuous.e).in(continuous.a)).toBe(false);
        expect(continuousSubset(continuous.b, continuous.h)).toBe(false);
        expect(allOf(continuous.h).in(continuous.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(continuousSubset(continuous.a, continuous.c)).toBe(true);
        expect(allOf(continuous.c).in(continuous.a)).toBe(true);
        expect(continuousSubset(continuous.b, continuous.f)).toBe(true);
        expect(allOf(continuous.f).in(continuous.f)).toBe(true);
      });
    });
    describe('Overlap', () => {
      it('should fail with disjoint', () => {
        expect(continuousOverlap(continuous.a, continuous.b)).toBe(false);
        expect(someOf(continuous.b).in(continuous.a)).toBe(false);
        expect(continuousOverlap(continuous.a, continuous.h)).toBe(false);
        expect(someOf(continuous.h).in(continuous.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(continuousOverlap(continuous.a, continuous.d)).toBe(false);
        expect(someOf(continuous.d).in(continuous.a)).toBe(true);
        expect(continuousOverlap(continuous.b, continuous.g)).toBe(false);
        expect(someOf(continuous.g).in(continuous.b)).toBe(true);
      });
      it('should succeed with overlap', () => {
        expect(continuousOverlap(continuous.a, continuous.e)).toBe(true);
        expect(someOf(continuous.e).in(continuous.a)).toBe(true);
        expect(continuousOverlap(continuous.b, continuous.h)).toBe(true);
        expect(someOf(continuous.h).in(continuous.b)).toBe(true);
      });
      it('should fail with equal', () => {
        expect(continuousOverlap(continuous.a, continuous.c)).toBe(false);
        expect(someOf(continuous.c).in(continuous.a)).toBe(true);
        expect(continuousOverlap(continuous.b, continuous.f)).toBe(false);
        expect(someOf(continuous.f).in(continuous.b)).toBe(true);
      });
    });
    describe('Equal', () => {
      it('should fail with disjoint', () => {
        expect(continuousEqual(continuous.a, continuous.b)).toBe(false);
        expect(allOf(continuous.b).equal(continuous.a)).toBe(false);
        expect(continuousEqual(continuous.a, continuous.h)).toBe(false);
        expect(allOf(continuous.h).equal(continuous.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(continuousEqual(continuous.a, continuous.d)).toBe(false);
        expect(allOf(continuous.d).equal(continuous.a)).toBe(false);
        expect(continuousEqual(continuous.b, continuous.g)).toBe(false);
        expect(allOf(continuous.g).equal(continuous.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(continuousEqual(continuous.a, continuous.e)).toBe(false);
        expect(allOf(continuous.e).equal(continuous.a)).toBe(false);
        expect(continuousEqual(continuous.b, continuous.h)).toBe(false);
        expect(allOf(continuous.h).equal(continuous.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(continuousEqual(continuous.a, continuous.c)).toBe(true);
        expect(allOf(continuous.c).equal(continuous.a)).toBe(true);
        expect(continuousEqual(continuous.b, continuous.f)).toBe(true);
        expect(allOf(continuous.f).equal(continuous.b)).toBe(true);
      });
    });
  });
});
