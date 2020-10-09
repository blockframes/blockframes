import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarInitialComponent } from './avatar-initial.component';

describe('AvatarInitialComponent', () => {
  let component: AvatarInitialComponent;
  let fixture: ComponentFixture<AvatarInitialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvatarInitialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarInitialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
