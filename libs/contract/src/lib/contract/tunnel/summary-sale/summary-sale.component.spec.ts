import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySaleComponent } from './summary-sale.component';

describe('SummarySaleComponent', () => {
  let component: SummarySaleComponent;
  let fixture: ComponentFixture<SummarySaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarySaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarySaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
