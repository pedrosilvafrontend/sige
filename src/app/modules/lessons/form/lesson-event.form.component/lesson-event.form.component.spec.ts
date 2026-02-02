import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LesEventFormComponent } from './lesson-event.form.component';

describe('LessonFormComponentComponent', () => {
  let component: LesEventFormComponent;
  let fixture: ComponentFixture<LesEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LesEventFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LesEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
