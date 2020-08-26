// Timeout can be adjusted
// jest.setTimeout(30000);

describe('Unit testing examples', () => {
  it('should instruct you how to test expected errors', async () => {
    try {
      throw Error('test error');
      // fail(); add fail to make sure that test did not pass because no error was raised
    } catch (err) {
      expect(err.message).toEqual('test error');
    }
  });
});
