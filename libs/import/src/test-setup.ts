import 'jest-preset-angular';
import 'jest';

// To prevent 'DragEvent' is not defined
// @see https://github.com/nrwl/nx/issues/1178
Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent { }
});