import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsMandateComponent } from './details-mandate.component';

describe('DetailsMandateComponent', () => {
  let component: DetailsMandateComponent;
  let fixture: ComponentFixture<DetailsMandateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsMandateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsMandateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
