import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnonProfileComponent } from './anon-profile.component';

describe('AnonProfileComponent', () => {
  let component: AnonProfileComponent;
  let fixture: ComponentFixture<AnonProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnonProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnonProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
