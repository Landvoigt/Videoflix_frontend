import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateProfileComponent } from './dialog-create-profile.component';

describe('DialogCreateProfileComponent', () => {
  let component: DialogCreateProfileComponent;
  let fixture: ComponentFixture<DialogCreateProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
