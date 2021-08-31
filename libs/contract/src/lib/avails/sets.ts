
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
    in: (b: Range) => optional && (!a.from || !a.to) ? true : a.from >= b.from && a.to <= b.to,
    equal: (b: Range) => optional && (!a.from || !a.to) ? true : !(a.from < b.from) && !(a.from > b.from) && !(a.to < b.to) && !(a.to > b.to),
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
    in: (b: Range) => optional && (!a.from || !a.to) ? true : a.to < b.from || b.to < a.from,
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
    in: (b: Range) => optional && (!a.from || !a.to) ? true : (a.from >= b.from && a.from <= b.to) || (a.to >= b.from && a.to <= b.to) || continuousAllOf(b, optional).in(a),
  };
}

export function someOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteSomeOf>;
export function someOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousSomeOf>;
export function someOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteSomeOf(a, optional) : continuousSomeOf(a, optional);
}
