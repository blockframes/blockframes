import 'jest-preset-angular/setup-jest';
import 'jest';

global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]), }),) as jest.Mock;

jest.setTimeout(10000);
