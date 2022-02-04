export function assertDate(provided: Date, expected: Date) {
  expect(provided.getTime()).toBe(expected.getTime());
}
