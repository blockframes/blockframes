import { DynamicTitleService } from './dynamic-title.service.ts.service';
import { TestBed, inject } from '@angular/core/testing';


describe('Service: DynamicTitleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicTitleService]
    });
  });

  it('should instantiate', inject([DynamicTitleService], (service: DynamicTitleService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a title with two dashes when setTitlePage foruth parameter is set', inject([DynamicTitleService], (service: DynamicTitleService) => {
    const { entityWithSection, section } = { section: Math.random().toString(), entityWithSection: Math.random().toString() };
    const result = service.setPageTitle('catalog', section, entityWithSection)
    expect(result).toBe(`${entityWithSection} - ${section} - Archipel Content`)
  }))
});
