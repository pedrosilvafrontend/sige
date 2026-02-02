import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherFormDialogComponent } from './teacher-form-dialog.component';

describe('FormDialogComponent', () => {
  let component: TeacherFormDialogComponent;
  let fixture: ComponentFixture<TeacherFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TeacherFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
