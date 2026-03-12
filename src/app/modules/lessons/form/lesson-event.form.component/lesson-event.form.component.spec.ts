import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEventFormComponent } from './lesson-event.form.component';

describe('LessonEventFormComponent', () => {
  let component: LessonEventFormComponent;
  let fixture: ComponentFixture<LessonEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonEventFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
