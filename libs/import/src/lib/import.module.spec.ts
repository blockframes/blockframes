import { async, TestBed } from '@angular/core/testing';
import { ImportModule } from './import.module';

describe('ImportModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ImportModule]
    }).compileComponents();
  }));

  it.skip('should create', () => {
    expect(ImportModule).toBeDefined();
  });
});
