import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagersFormDialogComponent } from './managers-form-dialog.component';

describe('FormDialogComponent', () => {
  let component: ManagersFormDialogComponent;
  let fixture: ComponentFixture<ManagersFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ManagersFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagersFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
