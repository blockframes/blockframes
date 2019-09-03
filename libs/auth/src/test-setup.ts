import 'jest-preset-angular';
import 'jest';

// Mock DragEvent until jsdom provide a valid implementation
Object.defineProperty(window, 'DragEvent', {
  // TODO: issue#875, use DragEvent type
  value: class Any {}
});
