import 'jest-preset-angular/setup-jest';
import 'jest';

global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]), }),) as jest.Mock;

jest.setTimeout(10000);

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false },
});
