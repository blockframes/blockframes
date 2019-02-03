import { async, TestBed } from '@angular/core/testing';
import { IpModule } from './ip.module';

describe('IpModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IpModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(IpModule).toBeDefined();
  });
});
