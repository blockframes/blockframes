import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryMandateComponent } from './summary-mandate.component';

describe('SummaryMandateComponent', () => {
  let component: SummaryMandateComponent;
  let fixture: ComponentFixture<SummaryMandateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryMandateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryMandateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
