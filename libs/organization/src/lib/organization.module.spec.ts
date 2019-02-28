import { async, TestBed } from '@angular/core/testing';
import { OrganizationModule } from './organization.module';

describe('OrganizationModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OrganizationModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(OrganizationModule).toBeDefined();
  });
});
