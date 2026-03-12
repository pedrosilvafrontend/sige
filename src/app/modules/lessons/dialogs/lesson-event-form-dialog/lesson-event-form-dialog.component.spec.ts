import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEventFormDialogComponent } from './lesson-event-form-dialog.component';

describe('LessonEventFormDialogComponent', () => {
  let component: LessonEventFormDialogComponent;
  let fixture: ComponentFixture<LessonEventFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LessonEventFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonEventFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
