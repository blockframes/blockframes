
import {
  allOf,
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
        expect(noneOf(discrete.b).in(discrete.a)).toBe(true);
        expect(noneOf(discrete.h).in(discrete.a)).toBe(true);
      });
      it('should fail with subset', () => {
        expect(noneOf(discrete.d).in(discrete.a)).toBe(false);
        expect(noneOf(discrete.g).in(discrete.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
        expect(noneOf(discrete.h).in(discrete.b)).toBe(false);
      });
      it('should fail with equal', () => {
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
        expect(noneOf(discrete.e).in(discrete.a)).toBe(false);
      });
    });
    describe('Subset', () => {
      it('should fail with disjoint', () => {
        expect(allOf(discrete.b).in(discrete.a)).toBe(false);
        expect(allOf(discrete.h).in(discrete.a)).toBe(false);
      });
      it('should succeed with subset', () => {
        expect(allOf(discrete.d).in(discrete.a)).toBe(true);
        expect(allOf(discrete.g).in(discrete.b)).toBe(true);
      });
      it('should fail with overlap', () => {
        expect(allOf(discrete.e).in(discrete.a)).toBe(false);
        expect(allOf(discrete.h).in(discrete.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(allOf(discrete.c).in(discrete.a)).toBe(true);
        expect(allOf(discrete.f).in(discrete.b)).toBe(true);
      });
    });
    describe('Overlap', () => {
      it('should fail with disjoint', () => {
        expect(someOf(discrete.b).in(discrete.a)).toBe(false);
        expect(someOf(discrete.h).in(discrete.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(someOf(discrete.d).in(discrete.a)).toBe(true);
        expect(someOf(discrete.g).in(discrete.b)).toBe(true);
      });
      it('should succeed with overlap', () => {
        expect(someOf(discrete.e).in(discrete.a)).toBe(true);
        expect(someOf(discrete.h).in(discrete.b)).toBe(true);
      });
      it('should fail with equal', () => {
        expect(someOf(discrete.c).in(discrete.a)).toBe(true);
        expect(someOf(discrete.f).in(discrete.b)).toBe(true);
      });
    });
    describe('Equal', () => {
      it('should fail with disjoint', () => {
        expect(allOf(discrete.b).equal(discrete.a)).toBe(false);
        expect(allOf(discrete.h).equal(discrete.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(allOf(discrete.d).equal(discrete.a)).toBe(false);
        expect(allOf(discrete.g).equal(discrete.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(allOf(discrete.e).equal(discrete.a)).toBe(false);
        expect(allOf(discrete.h).equal(discrete.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(allOf(discrete.c).equal(discrete.a)).toBe(true);
        expect(allOf(discrete.f).equal(discrete.b)).toBe(true);
      });
    });
  });
  describe('Continuous Sets', () => {
    describe('Disjoint', () => {
      it('should succeed with disjoint', () => {
        expect(noneOf(continuous.b).in(continuous.a)).toBe(true);
        expect(noneOf(continuous.h).in(continuous.a)).toBe(true);
      });
      it('should fail with subset', () => {
        expect(noneOf(continuous.d).in(continuous.a)).toBe(false);
        expect(noneOf(continuous.g).in(continuous.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(noneOf(continuous.e).in(continuous.a)).toBe(false);
        expect(noneOf(continuous.h).in(continuous.b)).toBe(false);
      });
      it('should fail with equal', () => {
        expect(noneOf(continuous.c).in(continuous.a)).toBe(false);
        expect(noneOf(continuous.f).in(continuous.b)).toBe(false);
      });
    });
    describe('Subset', () => {
      it('should fail with disjoint', () => {
        expect(allOf(continuous.b).in(continuous.a)).toBe(false);
        expect(allOf(continuous.h).in(continuous.a)).toBe(false);
      });
      it('should succeed with subset', () => {
        expect(allOf(continuous.d).in(continuous.a)).toBe(true);
        expect(allOf(continuous.g).in(continuous.b)).toBe(true);
      });
      it('should fail with overlap', () => {
        expect(allOf(continuous.e).in(continuous.a)).toBe(false);
        expect(allOf(continuous.h).in(continuous.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(allOf(continuous.c).in(continuous.a)).toBe(true);
        expect(allOf(continuous.f).in(continuous.f)).toBe(true);
      });
    });
    describe('Overlap', () => {
      it('should fail with disjoint', () => {
        expect(someOf(continuous.b).in(continuous.a)).toBe(false);
        expect(someOf(continuous.h).in(continuous.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(someOf(continuous.d).in(continuous.a)).toBe(true);
        expect(someOf(continuous.g).in(continuous.b)).toBe(true);
      });
      it('should succeed with overlap', () => {
        expect(someOf(continuous.e).in(continuous.a)).toBe(true);
        expect(someOf(continuous.h).in(continuous.b)).toBe(true);
      });
      it('should fail with equal', () => {
        expect(someOf(continuous.c).in(continuous.a)).toBe(true);
        expect(someOf(continuous.f).in(continuous.b)).toBe(true);
      });
    });
    describe('Equal', () => {
      it('should fail with disjoint', () => {
        expect(allOf(continuous.b).equal(continuous.a)).toBe(false);
        expect(allOf(continuous.h).equal(continuous.a)).toBe(false);
      });
      it('should fail with subset', () => {
        expect(allOf(continuous.d).equal(continuous.a)).toBe(false);
        expect(allOf(continuous.g).equal(continuous.b)).toBe(false);
      });
      it('should fail with overlap', () => {
        expect(allOf(continuous.e).equal(continuous.a)).toBe(false);
        expect(allOf(continuous.h).equal(continuous.b)).toBe(false);
      });
      it('should succeed with equal', () => {
        expect(allOf(continuous.c).equal(continuous.a)).toBe(true);
        expect(allOf(continuous.f).equal(continuous.b)).toBe(true);
      });
    });
  });
});
