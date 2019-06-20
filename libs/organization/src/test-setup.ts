import 'jest-preset-angular';
import 'jest';

// Mock DragEvent until jsdom provide a valid implementation
Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {}
});
