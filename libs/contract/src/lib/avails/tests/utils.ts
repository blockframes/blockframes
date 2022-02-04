export function assertDate(provided: Date, expected: Date) {
  expect(provided.getTime()).toBe(expected.getTime());
}

export function assetArray(provided:number[], expected:number[]){
  expect(provided).toEqual(expected);
}
