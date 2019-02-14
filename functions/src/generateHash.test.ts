import { hashFile, RE_IP_UPLOAD } from './generateHash';

const TEST_FILE: string = __filename;


test('check file hash', async () => {
  const f: string = await hashFile(TEST_FILE);
  expect(f).toBeTruthy();
  expect(f.startsWith('0x'));
});

test('check document matching', () => {
  expect('ip/some-ip/version/another-version.pdf'.match(RE_IP_UPLOAD)).toBeTruthy();
  expect('ip/some-ip/another-version.pdf'.match(RE_IP_UPLOAD)).toBeFalsy();
  expect('wolo/some-ip/version/another-version.pdf'.match(RE_IP_UPLOAD)).toBeFalsy();
  expect('ip/another-version.pdf'.match(RE_IP_UPLOAD)).toBeFalsy();
});

