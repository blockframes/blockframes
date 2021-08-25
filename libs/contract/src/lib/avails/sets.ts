
// ----------------------------
//        DISCRETE SETS      //
// ----------------------------

/**
 * Every elements of A **are not** in B:
 * - A & B are totally different
 */
export function discreteDisjoint(a: string[], b: string[]) {
  return a.every(elt => !b.includes(elt));
}

/**
 * Every elements of B **are** in A:
 * - B is a subset of A
 * - A & B can be equal
 */
export function discreteSubset(a: string[], b: string[]) {
  return b.every(elt => a.includes(elt));
}

/** Some elements of A & B overlap, but some elements are also different */
export function discreteOverlap(a: string[], b: string[]) {
  return !discreteDisjoint(a, b) && !discreteSubset(a, b);
}

/** A and B contains exactly the same elements */
export function discreteEqual(a: string[], b: string[]) {
  return discreteSubset(a, b) && discreteSubset(b, a);
}


// ----------------------------
//       CONTINUOUS SETS     //
// ----------------------------

/**
 * Every elements of A **are not** in B:
 * - A & B are totally different
 */
export function continuousDisjoint<T = Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return b.to < a.from || b.from >  a.to;
}

/**
 * Every elements of B **are** in A:
 * - B is a subset of A
 */
export function continuousSubset<T = Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return a.from <= b.from && a.to >= b.to;
}

/** Some elements of A & B overlap, but some elements are also different */
export function continuousOverlap<T = Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return !continuousDisjoint(a, b) && !continuousSubset(a, b);
}

/** A and B contains exactly the same elements */
export function continuousEqual<T = Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return continuousSubset(a, b) && continuousSubset(b, a);
}
