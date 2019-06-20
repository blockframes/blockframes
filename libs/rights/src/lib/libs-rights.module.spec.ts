import { async, TestBed } from '@angular/core/testing';
import { LibsRightsModule } from './libs-rights.module';

describe('LibsRightsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LibsRightsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LibsRightsModule).toBeDefined();
  });
});
