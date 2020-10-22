import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerVideoComponent } from './container-video.component';

describe('ContainerVideoComponent', () => {
  let component: ContainerVideoComponent;
  let fixture: ComponentFixture<ContainerVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
