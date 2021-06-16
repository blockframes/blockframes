import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContracItemComponent } from './contrac-item.component';

describe('ContracItemComponent', () => {
  let component: ContracItemComponent;
  let fixture: ComponentFixture<ContracItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContracItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContracItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
