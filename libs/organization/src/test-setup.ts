import 'jest-preset-angular';
import 'jest';

// Mock any until jsdom provide a valid implementation
Object.defineProperty(window, 'DragEvent', {
  // TODO: issue#875, use DragEvent type
  value: class Any {}
});
