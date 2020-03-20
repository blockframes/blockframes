import { async, TestBed } from '@angular/core/testing';
import { UserModule } from './user.module';

describe('UserModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UserModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UserModule).toBeDefined();
  });
});
