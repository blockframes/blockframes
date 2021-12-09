
// ----------------------------
//         EASY COMPARE      //
// ----------------------------


// Helpers functions used to check collision, inclusion, etc...
// This is used for example in avail.ts
// These functions can handle two type of data:
// - discrete = `string[]`
// - continuous = `Range`


interface Range { from: number | Date, to: number | Date };

function discreteAllOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.every(elt => b.includes(elt)),

    // it's equal if every A is included in B AND if every B is also included in A
    // but we also check the length to avoid the case where A or B has duplicated elements
    equal: (b: string[]) => optional && !a.length ? true : a.length === b.length && a.every(elt => b.includes(elt)) && b.every(elt => a.includes(elt)),
  };
}

function continuousAllOf(a?: Range, optional?: 'optional') {
  return {
    // for continuous data, A is "in" B if the range are like that
    //   A.from   A.to
    //     |------|
    //   |----------|
    // B.from      B.to
    //
    // we also pre-suppose that Range are not malformed (i.e. from must be before to)
    in: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true
      else return a?.from >= b?.from && a?.to <= b?.to
    },

    // To check if it's equal we simply check if `a.to === b.to && a.from === b.from`
    // BUT since we cannot compare Date with `===` we use "not lesser than && not greater than"
    equal: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true
      else return !(a?.from < b?.from) && !(a?.from > b?.from) && !(a?.to < b?.to) && !(a?.to > b?.to)
    },
  }
}

/**
 * Check if all of the elements of A are in or equal to the elements of B.
 *
 * After calling `allOf(a)` you **MUST** call `.in(b)` or `.equal(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * allOf(a).in(b);
 * allOf(a).equal(b);
 * allOf([], 'optional').in(b); // true
 */
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


//      A.to
//  ...--|
//          |---...
//        B.from
//
// ~~~~~~~~~~ OR ~~~~~~~~
//
//         A.from
//           |---...
//   ...---|
//       B.to
function continuousNoneOf(a: Range, optional?: 'optional') {
  return {
    in: (b: Range) => optional && (!a?.from || !a?.to) ? true : a?.to < b?.from || b?.to < a?.from,
  };
}

/**
 * Check if none of the elements of A are in the elements of B, i.e. A and B are totally different
 *
 * After calling `noneOf(a)` you **MUST** call `.in(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * noneOf(a).in(b);
 * noneOf([], 'optional').in(b); // true
 */
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

//      A.from
//       |---...
//  |------------|
// B.from      B.to
//
// ~~~~~~~~~~~~~~ OR ~~~~~~~~~~~~~
//
//        A.to
//   ...---|
//   |----------|
// B.from      B.to
//
// ~~~~~~~~~~~~~~ OR ~~~~~~~~~~~~~
//
//  A.from           A.to
//   |----------------|
//     |----------|
//   B.from     B.to
function continuousSomeOf(a?: Range, optional?: 'optional') {
  return {
    in: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true;
      return (a?.from >= b?.from && a?.from <= b?.to) || (a?.to >= b?.from && a?.to <= b?.to) || continuousAllOf(b, optional).in(a)
    },
  };
}

/**
 * Check if some of the elements of A are in the elements of B, i.e. A and B overlap somehow (A ⊆ B or A ⊇ B or A = B)
 *
 * After calling `someOf(a)` you **MUST** call `.in(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * someOf(a).in(b);
 * someOf([], 'optional').in(b); // true
 */
export function someOf(a?: string[], optional?: 'optional'): ReturnType<typeof discreteSomeOf>;
export function someOf(a?: Range, optional?: 'optional'): ReturnType<typeof continuousSomeOf>;
export function someOf(a?: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteSomeOf(a, optional) : continuousSomeOf(a, optional);
}


// ----------------------------
// SPECIAL EXCLUSIVITY CHECK

export function exclusivityAllOf(availsExclusivity: boolean) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ✅    |       ✅     |
  // Mandate        -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return {
    in: (termExclusivity: boolean) => termExclusivity || !availsExclusivity,
  };
}

export function exclusivitySomeOf(availsExclusivity: boolean) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ❌    |       ❌     |
  // Sale           -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return {
    in: (termExclusivity: boolean) => !termExclusivity && !availsExclusivity,
  };
}
