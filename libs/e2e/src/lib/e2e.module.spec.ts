import { async, TestBed } from '@angular/core/testing';
import { E2eModule } from './e2e.module';

describe('E2eModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [E2eModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(E2eModule).toBeDefined();
  });
});
