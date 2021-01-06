import { TestBed } from '@angular/core/testing';
import { ImportModule } from './import.module';

describe('ImportModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ImportModule]
    }).compileComponents();
  });

  it.skip('should create', () => {
    expect(ImportModule).toBeDefined();
  });
});
