import 'jest-preset-angular/setup-jest';
import 'jest';

// To prevent 'DragEvent' is not defined
// @see https://github.com/nrwl/nx/issues/1178
Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {},
});

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false },
});
