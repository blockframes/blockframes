import { async, TestBed } from '@angular/core/testing';
import { CatalogModule } from './catalog.module';

describe('CatalogModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CatalogModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CatalogModule).toBeDefined();
  });
});
