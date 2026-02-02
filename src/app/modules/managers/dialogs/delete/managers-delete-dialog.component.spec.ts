import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagersDeleteDialogComponent } from './managers-delete-dialog.component';

describe('TeacherDeleteDialogComponent', () => {
  let component: ManagersDeleteDialogComponent;
  let fixture: ComponentFixture<ManagersDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ManagersDeleteDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagersDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
