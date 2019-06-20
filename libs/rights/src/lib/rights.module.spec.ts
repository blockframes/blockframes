import { async, TestBed } from '@angular/core/testing';
import { RightsModule } from './rights.module';

describe('RightsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RightsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RightsModule).toBeDefined();
  });
});
