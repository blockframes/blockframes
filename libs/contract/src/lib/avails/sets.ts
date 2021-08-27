
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
export function continuousDisjoint<T extends Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return b.to < a.from || b.from >  a.to;
}

/**
 * Every elements of B **are** in A:
 * - B is a subset of A
 * - A & B can be equal
 */
export function continuousSubset<T extends Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return a.from <= b.from && a.to >= b.to;
}

/** Some elements of A & B overlap, but some elements are also different */
export function continuousOverlap<T extends Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return !continuousDisjoint(a, b) && !continuousSubset(a, b);
}

/** A and B contains exactly the same elements */
export function continuousEqual<T extends Date | number>(a: { from: T, to: T }, b: { from: T, to: T }) {
  return continuousSubset(a, b) && continuousSubset(b, a);
}



// ----------------------------
//         EASY COMPARE      //
// ----------------------------

interface Range { from: number | Date, to: number | Date };

function discreteAllOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.every(elt => b.includes(elt)),
    equal: (b: string[]) => optional && !a.length ? true : a.length === b.length && a.every(elt => b.includes(elt)) && b.every(elt => a.includes(elt)),
  };
}

function continuousAllOf(a: Range, optional?: 'optional') {
  return {
    in: (b: Range) => optional && a.from && a.to ? true : a.from >= b.from && a.to <= b.to,
    equal: (b: Range) => optional && a.from && a.to ? true : !(a.from < b.from) && !(a.from > b.from) && !(a.to < b.to) && !(a.to > b.to),
  }
}

export function allOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteAllOf>;
export function allOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousAllOf>;
export function allOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteAllOf(a, optional) : continuousAllOf(a, optional);
}

function discreteNoneOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.every(elt => !b.includes(elt)),
  };
}

function continuousNoneOf(a: Range, optional?: 'optional') {
  return {
    in: (b: Range) => optional && a.from && a.to ? true : a.to < b.from || b.to < a.from,
  };
}

export function noneOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteNoneOf>;
export function noneOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousNoneOf>;
export function noneOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteNoneOf(a, optional) : continuousNoneOf(a, optional);
}

function discreteSomeOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.some(elt => b.includes(elt)),
  };
}

function continuousSomeOf(a: Range, optional?: 'optional') {
  return {
    in: (b: Range) => optional && a.from && a.to ? true : (a.from >= b.from && a.from <= b.to) || (a.to >= b.from && a.to <= b.to),
  };
}

export function someOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteSomeOf>;
export function someOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousSomeOf>;
export function someOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteSomeOf(a, optional) : continuousSomeOf(a, optional);
}
